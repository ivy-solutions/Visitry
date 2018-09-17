module.exports = {
  servers: {
    one: {
      host: 'dev.visitry.org',
      username: 'ubuntu',
      // for CircleCi:
      pem: '/home/ubuntu/.ssh/id_staging-server',
      //for Sarah;s machine
      //pem: '/Users/sarahcoletti/VISITRY.pem',
      // password:
      // or leave blank for authenticate from ssh-agent
      opts: {
        port: 22
      }
    },
  },

  meteor: {
    name: 'Visitry',
    // For CircleCI
    path: '/home/circleci/project',
    //for Sarah's machine
    //path: '/Users/sarahcoletti/WebstormProjects/Visitry',
    // port: 000, // useful when deploying multiple instances (optional)
    // volumes: { // lets you add docker volumes (optional)
    //   "/host/path": "/container/path", // passed as '-v /host/path:/container/path' to the docker run command
    //   "/second/host/path": "/second/container/path"
    // },
    docker: {
      // change to 'abernix/meteord:base' if your app is using Meteor 1.4 - 1.5
      image: 'abernix/meteord:base'
      //image: 'abernix/meteord:node-8.4.0-base'
    },
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
      debug: false,
      cleanAfterBuild: true, // default
      buildLocation: '/home/circleci/project/build' // defaults to /tmp/<uuid>
      //buildLocation: '/Users/sarahcoletti/build/Visitry', // defaults to /tmp/<uuid>
      //mobileSettings: {
      //}
    },

    env: {
      PORT: 3000,
      ROOT_URL: 'https://dev.visitry.org',
      MONGO_URL: 'mongodb://localhost/meteor'
    },

    // ssl: { // (optional)
    //   // Enables let's encrypt (optional)
    //   autogenerate: {
    //     email: 'email.address@domain.com',
    //     // comma separated list of domains
    //     domains: 'website.com,www.website.com'
    //   }
    // },
    ssl: {
      port: 443,
      crt: 'bundle.crt',
      key: 'private.key'
    },

    deployCheckWaitTime: 600,


    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

  mongo: {
    version: '3.4.1',
    servers: {
      one: {}
    }
  }
}
