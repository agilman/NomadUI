<template>
  <div>
    <button
      class="flex py-2 px-2 m-2 border rounded bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
      @click="$refs.imgUpload.click()"
    >
      Upload
    </button>
    <input ref="imgUpload" hidden type="file" accept="image/jpeg" @change="onFileChange">
  </div>
</template>

<script>
export default {
  methods: {
    onFileChange (e) {
      const files = e.target.files

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])
        formData.append('userId', 1)
        formData.append('advId', 1)
        formData.append('mapId', 1)

        this.$axios.post('http://localhost:8000/api/rest/photos/photoUpload',
          formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(function () {
          console.log('SUCCESS!!')
        })
      }
    }
  },
  layout: 'editor'
}
</script>
