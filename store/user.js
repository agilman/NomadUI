export const state = () => ({
  user_id: null,
  username: ''
})

export const mutations = {
  setId (state, uid) {
    state.user_id = uid
  },
  setUserName (state, name) {
    state.username = name
  }
}
