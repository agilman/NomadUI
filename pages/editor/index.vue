<template>
  <div>
    <div class="flex justify-center p-6 ml-6 mr-6">
      <div class="flex">
        <div>
          <h1>Adventures:</h1>
          <div id="advList" class="flex-col">
            <div v-for="adv in adventures" :key="adv.id" class="border rounded mt-1 mb-1 py-2 px-2 justify-between">
              <span>
                {{ adv.name }}
              </span>
              <span>
                <button class="border rounded py-2 px-2 hover:shadow-outline">
                  delete
                </button>
              </span>
            </div>
          </div>
          <br>
          <div>
            <h1>New Adventure:</h1>
            <input v-model="advName" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="New Adventure Name">
            <br>
            <div class="flex">
              <div class="inline-block relative w-full">
                <select v-model="advType" class="block mt-1 mb-1 appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                  <option value="1">
                    Bicycle Touring
                  </option>
                  <option value="2">
                    Backpacking
                  </option>
                  <option value="3">
                    Car Trip
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
            <div class="inline-block relative w-full">
              <select v-model="advStatus" class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                <option value="1">
                  In Planning
                </option>
                <option value="2">
                  In Progress
                </option>
                <option value="3">
                  Completed
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
            <button
              class="flex mt-1 w-full border rounded px-2 py-2 bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
              @click="createAdv"
            >
              Create!
            </button>
          </div>
        </div>
      </div> <!-- Left -->
      <div class="flex ml-10">
        <div class="flex-col px-2">
          <div>
            <h1>Profile photo:</h1>
            <img src="~/static/Portrait_Placeholder.png" style="height:150pt"></img>
          </div>
          <div>
            <button class="flex mt-1 px-2 py-2 w-full border rounded bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline">
              Upload Photo
            </button>
          </div>
        </div> <!-- Right -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // TODO: get logged in userID... if not logged in redirect to login page.
  // if logged in, get users adventures
  // if user nas adventures, display a list of them
  //  async asyncData ({ $axios, params }) {
  //  const uname = params.username
  //  const userData = await $axios.$get('http://localhost:8000/api/rest/adventures/' + uname)
  // },
  async fetch () {
    this.adventures = await this.$axios.$get('http://localhost:8000/api/rest/me/' + this.$store.state.user.user_id)
      .then(function (response) {
        return response.adventures
      })
  },
  data () {
    return {
      advName: '',
      advType: 1,
      advStatus: 1,
      adventures: []
    }
  },
  methods: {
    async createAdv () {
      const newAdv = {
        user: this.$store.state.user.user_id,
        advName: this.advName,
        advType: this.advType,
        advStatus: this.advStatus
      }
      const response = await this.$axios.$post('http://localhost:8000/api/rest/adventures/', newAdv)
      // TODO add data to store and clean up.
      console.log("Let's do it!", newAdv, response)
    }
  },
  layout: 'editor'
}
</script>
