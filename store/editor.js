// Stores information about the user logged in

export const state = () => ({
  adventures: [],
  activeAdvIndex: 0,
  maps: [],
  activeMapIndex: 0
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
  removeAdventure (state, advId) {
    for (let i = 0; i < state.adventures.length; i++) {
      if (state.adventures[i].id === advId) {
        state.adventures.splice(i, 1)
        break
      }
    }
    // TODO: change activeAdvIndex wisely...
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
  }
}
