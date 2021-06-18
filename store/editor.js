// Stores information about the user logged in

export const state = () => ({
  adventures: [],
  activeAdvIndex: 0,
  maps: [],
  activeMapIndex: 0,
  profilePhotos: []
})

export const mutations = {
  setAdventures (state, adventures) {
    for (let i = 0; i < adventures.length; i++) {
      state.adventures.push(adventures[i])
    }
  },
  addAdventure (state, adventure) {
    state.adventures.push(adventure)
    state.activeAdvIndex = state.adventures.length - 1
  },
  removeAdventure (state, delIndex) {
    if (delIndex <= state.activeAdvIndex) {
      if (state.adventures.length > 0) {
        if (state.activeAdvIndex > 0) {
          state.activeAdvIndex = state.activeAdvIndex - 1
        }
      }
    }
    state.adventures.splice(delIndex, 1)
  },
  setActiveAdv (state, index) {
    state.activeAdvIndex = index
  },
  setMaps (state, maps) {
    state.maps = [...maps]
  },
  addMap (state, map) {
    state.maps.push(map)
    state.activeMapIndex = state.maps.length - 1
  },
  removeMap (state, delIndex) {
    if (delIndex <= state.activeMapIndex) {
      if (state.maps.length > 0) {
        if (state.activeMapIndex > 0) {
          state.activeMapIndex = state.activeMapIndex - 1
        }
      }
    }
    state.maps.splice(delIndex, 1)
  },
  setActiveMap (state, index) {
    state.activeMapIndex = index
  },
  addSegment (state, segment) {
    state.maps[state.activeMapIndex].geojson.features.push(segment)
  },
  setProfilePhotos (state, photos) {
    state.profilePhotos = [...photos]
  },
  addProfilePhoto (state, photo) {
    state.profilePhotos.push(photo)
  }
}
