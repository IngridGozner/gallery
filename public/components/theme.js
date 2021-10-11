Vue.component('theme', {
  data: function () {
      return {
        title: 'Gallery',
        dialog: false,

        imageUrl: '',
        imageData: null,

        search: "",
        select: [],

        gallerylist: []
      }
    },

    created:
      function(){
        const list = [];

        firebase.database().ref('gallery').once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                  let childData = childSnapshot.val();
                  list.push(childData);
                });

            }).then(()=>{
              this.gallerylist = list;
            });

    },

    methods:{
      //add image to database
      addImageToDB(){
        const data = {
          photo: this.imageUrl,
          tagList: this.select
        }

        firebase.database().ref('gallery').push(data)
        .then((response) => {
          // console.log(response)
        })
        .catch(err => {
          console.log(err)
        })

        this.dialog = false;
        this.select = [];
        this.search = "";
        this.imageUrl = "";
        this.imageData = null;

        let val = null;

        firebase.database().ref('gallery').limitToLast(1).on('child_added', function(data) {
             val = data.val();
           });
           this.gallerylist.push(val);
           console.log("data added: " + JSON.stringify(val));
      },

      click1() {
        this.$refs.input1.click()
      },

      previewImage(event) {
        this.uploadValue=0;
        this.imageUrl=null;
        this.imageData = event.target.files[0];
        this.onUpload()
      },

      //add image to storage
      onUpload(){
        this.imageUrl=null;
        const storageRef=firebase.storage().ref(`${this.imageData.name}`).put(this.imageData);
        storageRef.on(`state_changed`,snapshot=>{
        this.uploadValue = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
          }, error=>{console.log(error.message)},
        ()=>{this.uploadValue=100;
            storageRef.snapshot.ref.getDownloadURL().then((url)=>{
                this.imageUrl =url;
              });
            }
          );
       },
    },
  template:
  ` <v-app id="inspire">

    <v-app-bar app
    color="#3F4045"
    >

      <v-toolbar-title class="mr-12 align-center">
        <span style="color:#fbfbfb; font-family: 'Uncial Antiqua'; font-size: 30px">{{ title }}</span>
      </v-toolbar-title>

      <v-row justify="end">
          <v-btn
            color="accent"
            outlined
            @click="dialog=true"
          >Upload</v-btn>
      </v-row>

      <v-dialog
        v-model="dialog"
        width="900"
      >
        <v-card elevation="2">
          <v-card-title>Upload Photo</v-card-title>
          <v-card-text>
          <v-layout row>
              <v-flex  md6 offset-sm3 >
               <div>
                 <div >
                   <v-btn @click="click1">choose a photo</v-btn>
                   <input type="file" ref="input1"
                    style="display: none"
                    @change="previewImage" accept="image/*" >
                 </div>

               <div v-if="imageData!=null">
                  <img class="preview" height="268" width="356" contain :src="imageUrl">
               <br>
               </div>

               </div>
               </v-flex>
            </v-layout>
            <v-layout row>
            <v-flex xs12>
              <v-combobox multiple
                    v-model="select"
                    label="Tags"
                    append-icon
                    chips
                    deletable-chips
                    class="tag-input"
                    :search-input.sync="search"
                    >
              </v-combobox>
            </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex class="text-center">
                <v-btn color="pink" @click="addImageToDB">upload</v-btn>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-dialog>

    </v-app-bar>

  <v-main>
    <v-container fluid>
      <v-row>
        <v-col
          v-for="n in gallerylist"
          :key="n.photo"
          class="d-flex child-flex"
          cols="4"
        >
                  <v-card>
                    <v-img
                      :src="\`\${n.photo}\`"
                      :lazy-src="\`\${n.photo}\`"
                      height="300"
                      contain
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
  </v-main>
  </v-app>
  `
})
