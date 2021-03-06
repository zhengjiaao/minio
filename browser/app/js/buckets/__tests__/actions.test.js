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
import * as actionsBuckets from "../actions"
import * as objectActions from "../../objects/actions"
import history from "../../history"

jest.mock("../../web", () => ({
  ListBuckets: jest.fn(() => {
    return Promise.resolve({ buckets: [{ name: "test1" }, { name: "test2" }] })
  }),
  MakeBucket: jest.fn(() => {
    return Promise.resolve()
  }),
  DeleteBucket: jest.fn(() => {
    return Promise.resolve()
  })
}))

jest.mock("../../objects/actions", () => ({
  selectPrefix: () => dispatch => {}
}))

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("Buckets actions", () => {
  it("creates buckets/SET_LIST and buckets/SET_CURRENT_BUCKET with first bucket after fetching the buckets", () => {
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/SET_LIST", buckets: ["test1", "test2"] },
      { type: "buckets/SET_CURRENT_BUCKET", bucket: "test1" }
    ]
    return store.dispatch(actionsBuckets.fetchBuckets()).then(() => {
      const actions = store.getActions()
      expect(actions).toEqual(expectedActions)
    })
  })

  it("creates buckets/SET_CURRENT_BUCKET with bucket name in the url after fetching buckets", () => {
    history.push("/test2")
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/SET_LIST", buckets: ["test1", "test2"] },
      { type: "buckets/SET_CURRENT_BUCKET", bucket: "test2" }
    ]
    window.location
    return store.dispatch(actionsBuckets.fetchBuckets()).then(() => {
      const actions = store.getActions()
      expect(actions).toEqual(expectedActions)
    })
  })

  it("creates buckets/SET_CURRENT_BUCKET with first bucket when the bucket in url is not exists after fetching buckets", () => {
    history.push("/test3")
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/SET_LIST", buckets: ["test1", "test2"] },
      { type: "buckets/SET_CURRENT_BUCKET", bucket: "test1" }
    ]
    window.location
    return store.dispatch(actionsBuckets.fetchBuckets()).then(() => {
      const actions = store.getActions()
      expect(actions).toEqual(expectedActions)
    })
  })

  it("creates buckets/SET_CURRENT_BUCKET action when selectBucket is called", () => {
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/SET_CURRENT_BUCKET", bucket: "test1" }
    ]
    store.dispatch(actionsBuckets.selectBucket("test1"))
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates buckets/SHOW_MAKE_BUCKET_MODAL for showMakeBucketModal", () => {
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/SHOW_MAKE_BUCKET_MODAL", show: true }
    ]
    store.dispatch(actionsBuckets.showMakeBucketModal())
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates buckets/SHOW_MAKE_BUCKET_MODAL for hideMakeBucketModal", () => {
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/SHOW_MAKE_BUCKET_MODAL", show: false }
    ]
    store.dispatch(actionsBuckets.hideMakeBucketModal())
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates buckets/SHOW_BUCKET_POLICY for showBucketPolicy", () => {
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/SHOW_BUCKET_POLICY", show: true }
    ]
    store.dispatch(actionsBuckets.showBucketPolicy())
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates buckets/SHOW_BUCKET_POLICY for hideBucketPolicy", () => {
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/SHOW_BUCKET_POLICY", show: false }
    ]
    store.dispatch(actionsBuckets.hideBucketPolicy())
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates buckets/SET_POLICIES action", () => {
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/SET_POLICIES", policies: ["test1", "test2"] }
    ]
    store.dispatch(actionsBuckets.setPolicies(["test1", "test2"]))
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates buckets/ADD action", () => {
    const store = mockStore()
    const expectedActions = [{ type: "buckets/ADD", bucket: "test" }]
    store.dispatch(actionsBuckets.addBucket("test"))
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates buckets/REMOVE action", () => {
    const store = mockStore()
    const expectedActions = [{ type: "buckets/REMOVE", bucket: "test" }]
    store.dispatch(actionsBuckets.removeBucket("test"))
    const actions = store.getActions()
    expect(actions).toEqual(expectedActions)
  })

  it("creates buckets/ADD and buckets/SET_CURRENT_BUCKET after creating the bucket", () => {
    const store = mockStore()
    const expectedActions = [
      { type: "buckets/ADD", bucket: "test1" },
      { type: "buckets/SET_CURRENT_BUCKET", bucket: "test1" }
    ]
    return store.dispatch(actionsBuckets.makeBucket("test1")).then(() => {
      const actions = store.getActions()
      expect(actions).toEqual(expectedActions)
    })
  })

  it("creates alert/SET, buckets/REMOVE, buckets/SET_LIST and buckets/SET_CURRENT_BUCKET " + 
     "after deleting the bucket", () => {
    const store = mockStore()
    const expectedActions = [
      { type: "alert/SET", alert: {id: 0, message: "Bucket 'test3' has been deleted.", type: "info"} },
      { type: "buckets/REMOVE", bucket: "test3" },
      { type: "buckets/SET_LIST", buckets: ["test1", "test2"] },
      { type: "buckets/SET_CURRENT_BUCKET", bucket: "test1" }
    ]
    return store.dispatch(actionsBuckets.deleteBucket("test3")).then(() => {
      const actions = store.getActions()
      expect(actions).toEqual(expectedActions)
    })
  })
})
