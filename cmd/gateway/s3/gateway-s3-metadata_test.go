// Copyright (c) 2015-2021 MinIO, Inc.
//
// This file is part of MinIO Object Storage stack
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

package s3

import (
	"bytes"
	"testing"

	minio "github.com/minio/minio/cmd"
)

// Tests for GW metadata format validity.
func TestGWMetaFormatValid(t *testing.T) {
	tests := []struct {
		name    int
		version string
		format  string
		want    bool
	}{
		{1, "123", "fs", false},
		{2, "123", gwMetaFormat, false},
		{3, gwMetaVersion, "test", false},
		{4, gwMetaVersion100, "hello", false},
		{5, gwMetaVersion, gwMetaFormat, true},
		{6, gwMetaVersion100, gwMetaFormat, true},
	}
	for _, tt := range tests {
		m := newGWMetaV1()
		m.Version = tt.version
		m.Format = tt.format
		if got := m.IsValid(); got != tt.want {
			t.Errorf("Test %d: Expected %v but received %v", tt.name, got, tt.want)
		}
	}
}

// Tests for reading GW metadata info.
func TestReadGWMetadata(t *testing.T) {
	tests := []struct {
		metaStr string
		pass    bool
	}{
		{`{"version": "` + gwMetaVersion + `", "format":"` + gwMetaFormat + `", "stat": {"size": 132, "modTime": "2018-08-31T22:25:39.23626461Z" }}`, true},
		{`{"version": "` + gwMetaVersion + `", "format":"` + gwMetaFormat + `", "stat": {"size": 132, "modTime": "0000-00-00T00:00:00.00000000Z" }}`, false},
		{`{"version": "` + gwMetaVersion + `", "format":"` + gwMetaFormat + `", "stat": {"size": 5242880, "modTime": "2018-08-31T22:25:39.23626461Z" },"meta":{"content-type":"application/octet-stream","etag":"57c743902b2fc8eea6ba3bb4fc58c8e8"},"parts":[{"number":1,"name":"part.1","etag":"","size":5242880}]}`, true},
		{`{"version": "` + gwMetaVersion + `", "format":"` + gwMetaFormat + `", "stat": {"size": 68190720, "modTime": "2018-08-31T22:25:39.23626461Z" },"meta":{"X-Minio-Internal-Encrypted-Multipart":"","X-Minio-Internal-Server-Side-Encryption-Iv":"kdbOcKdXD3Sew8tOiHe5eI9xkX1oQ2W9JURz0oslCZA=","X-Minio-Internal-Server-Side-Encryption-Seal-Algorithm":"DAREv2-HMAC-SHA256","X-Minio-Internal-Server-Side-Encryption-Sealed-Key":"IAAfAMfqKrxMXC9LuiI7ENP+p0xArepzAiIeB/MftFp7Xmq2OzDkKlmNbj5RKI89RrjiAbOVLSSEMvqQsrIrTQ==","content-type":"text/plain; charset=utf-8","etag":"2b137fa4ab80126af54623b010c98de6-2"},"parts":[{"number":1,"name":"part.1","etag":"c5cac075eefdab801a5198812f51b36e","size":67141632},{"number":2,"name":"part.2","etag":"ccdf4b774bc3be8eef9a8987309e8171","size":1049088}]}`, true},
		{`{"version": "` + gwMetaVersion + `", "format":"` + gwMetaFormat + `", "stat": {"size": "68190720", "modTime": "2018-08-31T22:25:39.23626461Z" },"meta":{"X-Minio-Internal-Encrypted-Multipart":"","X-Minio-Internal-Server-Side-Encryption-Iv":"kdbOcKdXD3Sew8tOiHe5eI9xkX1oQ2W9JURz0oslCZA=","X-Minio-Internal-Server-Side-Encryption-Seal-Algorithm":"DAREv2-HMAC-SHA256","X-Minio-Internal-Server-Side-Encryption-Sealed-Key":"IAAfAMfqKrxMXC9LuiI7ENP+p0xArepzAiIeB/MftFp7Xmq2OzDkKlmNbj5RKI89RrjiAbOVLSSEMvqQsrIrTQ==","content-type":"text/plain; charset=utf-8","etag":"2b137fa4ab80126af54623b010c98de6-2"},"parts":"123"}`, false},
	}

	for i, tt := range tests {
		buf := bytes.NewBufferString(tt.metaStr)
		m, err := readGWMetadata(minio.GlobalContext, *buf)
		if err != nil && tt.pass {
			t.Errorf("Test %d: Expected parse gw metadata to succeed, but failed, %s", i+1, err)
		}
		if err == nil && !tt.pass {
			t.Errorf("Test %d: Expected parse gw metadata to succeed, but failed", i+1)
		}
		if err == nil {
			if m.Version != gwMetaVersion {
				t.Errorf("Test %d: Expected version %s, but failed with %s", i+1, gwMetaVersion, m.Version)
			}
		}
	}
}
