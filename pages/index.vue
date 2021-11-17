<template>
  <v-app>
    <v-main>
      <v-card class="ma-5 pa-5" width="400" flat>
        <v-text-field
          v-model="username"
          label="username"
          required
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="password"
          required
        ></v-text-field>
        <v-btn :disabled="!loggedIn" @click="submit"> Login </v-btn>

        <v-alert
          class="my-5"
          :type="socket && socket.connected ? 'success' : 'error'"
          dense
        >
          {{ socketStatus }}
        </v-alert>

        <v-dialog v-model="dialog" width="300">
          <pre class="pa-5">{{ session }}</pre>
        </v-dialog>
        <v-btn text :disabled="loggedIn" @click="getSession">session</v-btn>
        |
        <v-btn :disabled="loggedIn" text @click="logout">logout</v-btn>
      </v-card>
    </v-main>
  </v-app>
</template>

<script>
import { io } from 'socket.io-client'

export default {
  async asyncData({ app }) {
    const session = await app.$axios.$get('/api/session')
    return { session }
  },

  data() {
    return {
      dialog: false,
      username: 'username1',
      password: 'password1',
      socket: null,
      socketStatus: 'disconnected',
      session: false,
    }
  },

  computed: {
    loggedIn() {
      return !this.session
    },
  },

  mounted() {
    if (this.session) {
      this.connectWs()
    }
  },

  methods: {
    async submit() {
      await this.$axios
        .$post('/api/login', {
          username: this.username,
          password: this.password,
        })
        .then((user) => {
          this.session = user
          if (this.socket && this.socket.connected) {
            this.socket.close()
          }
          this.connectWs()
        })
    },

    async logout() {
      await this.$axios.$post('/api/logout')
      if (this.socket) {
        this.socket.close()
      }
      this.session = false
    },

    async getSession() {
      this.session = await this.$axios.$get('/api/session')
      this.dialog = true
    },

    connectWs() {
      this.socket = io({ transports: ['websocket'] })
      this.socket.on('connect_error', (data) => {
        this.socketStatus = data.message
      })
      this.socket.on('echo', (data) => {
        this.socketStatus = data.message
      })

      this.socket.on('disconnect', (reason) => {
        this.socketStatus = 'disconnected'
        if (reason === 'io server disconnect') {
          this.socket.connect()
        }
      })
    },
  },
}
</script>
