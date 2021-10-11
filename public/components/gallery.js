Vue.component('gallery', {
  data: function () {
    return {
      galleryList: [],
    }
  },

  created:
    async function(){
      const list = [];

      await firebase.database().ref('gallery').once('value', function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                let childData = childSnapshot.val();
                list.push(childData);
              });

          }).then(()=>{
            this.galleryList = list;
            console.log("list: " + JSON.stringify(this.galleryList));
          })

  },

  template:
  `
  <v-container fluid>
    <v-row>
      <v-col
        v-for="n in galleryList"
        :key="n.photo"
        class="d-flex child-flex"
        cols="4"
      >
                <v-card>
                  <v-img
                    :src="\`\${n.photo}\`"
                    class="grey darken-4"
                  ></v-img>
                  <v-card-title class="text-h6">
                  <v-icon left>
                    mdi-label
                  </v-icon>
                    <v-chip v-for="tag in n.tagList">
                    {{ tag }}</v-chip>
                  </v-card-title>
                </v-card>
              </v-col>
      </v-row>
  </v-container>
  `
})
