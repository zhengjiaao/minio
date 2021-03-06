/*
 * Copyright (c) 2015-2021 MinIO, Inc.
 *
 * This file is part of MinIO Object Storage stack
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"
import * as uploadsActions from "../actions"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("Uploads actions", () => {
  it("creates uploads/ADD action", () => {
    const store = mockStore()
    const expectedActions = [
      {
        type: "uploads/ADD",
        slug: "a-b-c",
        size: 100,
        name: "test"
      }
    ]
    store.dispatch(uploadsActions.add("a-b-c", 100, "test"))
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates uploads/UPDATE_PROGRESS action", () => {
    const store = mockStore()
    const expectedActions = [
      {
        type: "uploads/UPDATE_PROGRESS",
        slug: "a-b-c",
        loaded: 50
      }
    ]
    store.dispatch(uploadsActions.updateProgress("a-b-c", 50))
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates uploads/STOP action", () => {
    const store = mockStore()
    const expectedActions = [
      {
        type: "uploads/STOP",
        slug: "a-b-c"
      }
    ]
    store.dispatch(uploadsActions.stop("a-b-c"))
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates uploads/SHOW_ABORT_MODAL action", () => {
    const store = mockStore()
    const expectedActions = [
      {
        type: "uploads/SHOW_ABORT_MODAL",
        show: true
      }
    ]
    store.dispatch(uploadsActions.showAbortModal())
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  describe("uploadFile", () => {
    const file = new Blob(["file content"], {
      type: "text/plain"
    })
    file.name = "file1"

    it("creates alerts/SET action when currentBucket is not present", () => {
      const store = mockStore({
        buckets: { currentBucket: "" }
      })
      const expectedActions = [
        {
          type: "alert/SET",
          alert: {
            id: 0,
            type: "danger",
            message: "Please choose a bucket before trying to upload files."
          }
        }
      ]
      const file = new Blob(["file content"], { type: "text/plain" })
      store.dispatch(uploadsActions.uploadFile(file))
      const actions = store.getActions()
      expect(actions).toEqual(expectedActions)
    })

    it("creates uploads/ADD action before uploading the file", () => {
      const store = mockStore({
        buckets: { currentBucket: "test1" },
        objects: { currentPrefix: "pre1/" }
      })
      const expectedActions = [
        {
          type: "uploads/ADD",
          slug: "test1-pre1/-file1",
          size: file.size,
          name: file.name
        }
      ]
      store.dispatch(uploadsActions.uploadFile(file))
      const actions = store.getActions()
      expect(actions).toEqual(expectedActions)
    })

    it("should open and send XMLHttpRequest", () => {
      const open = jest.fn()
      const send = jest.fn()
      const xhrMockClass = () => ({
        open: open,
        send: send,
        setRequestHeader: jest.fn(),
        upload: {
          addEventListener: jest.fn()
        }
      })
      window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass)
      const store = mockStore({
        buckets: { currentBucket: "test1" },
        objects: { currentPrefix: "pre1/" }
      })
      store.dispatch(uploadsActions.uploadFile(file))
      const objectPath = encodeURIComponent("pre1/file1")
      expect(open).toHaveBeenCalledWith(
        "PUT",
        "https://localhost:8080/upload/test1/" + objectPath,
        true
      )
      expect(send).toHaveBeenCalledWith(file)
    })
  })

  it("creates uploads/STOP and uploads/SHOW_ABORT_MODAL after abortUpload", () => {
    const store = mockStore()
    const expectedActions = [
      {
        type: "uploads/STOP",
        slug: "a-b/-c"
      },
      {
        type: "uploads/SHOW_ABORT_MODAL",
        show: false
      }
    ]
    store.dispatch(uploadsActions.abortUpload("a-b/-c"))
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })
})
