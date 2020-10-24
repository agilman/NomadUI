// This stores the information about the user who is logged in.
// user_id and username are stored at login time;

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
