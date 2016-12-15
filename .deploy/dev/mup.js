module.exports = {
  servers: {
    one: {
      host: 'dev.visitry.org',
      username: 'ubuntu',
      // for CircleCi:
      pem: '/home/.ssh/id_staging-server',
      //for Sarah;s machine
      //pem: '/Users/sarahcoletti/VISITRY.pem',
      // password:
      // or leave blank for authenticate from ssh-agent
      opts: {
        port: 22,
      },
    }
  },

  meteor: {
    name: 'Visitry',
    // For CircleCI
    path: '/home/ubuntu/Visitry',
    //for Sarah's machine
    //path: '/Users/sarahcoletti/WebstormProjects/Visitry',
    // port: 000, // useful when deploying multiple instances (optional)
    // volumes: { // lets you add docker volumes (optional)
    //   "/host/path": "/container/path", // passed as '-v /host/path:/container/path' to the docker run command
    //   "/second/host/path": "/second/container/path"
    // },
    docker: {
      //image: 'kadirahq/meteord', // (optional)
      image: 'abernix/meteord:base', // use this image if using Meteor 1.4+
      //args:[ // lets you add/overwrite any parameter on the docker run command (optional)
        // "--link=myCustomMongoDB:myCustomMongoDB", // linking example
        // "--memory-reservation 200M" // memory reservation example
      //]
    },
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
      debug: true,
      cleanAfterBuild: true, // default
      buildLocation: '/home/ubuntu/build/Visitry', // defaults to /tmp/<uuid>
      //buildLocation: '/Users/sarahcoletti/build/Visitry', // defaults to /tmp/<uuid>
      //mobileSettings: {
      //}
    },
    env: {
      PORT: 3000,
      ROOT_URL: 'https://dev.visitry.org',
      MONGO_URL: 'mongodb://localhost/meteor'
    },
    ssl: {
      port: 443,
      crt: 'bundle.crt',
      key: 'private.key',
    },

    deployCheckWaitTime: 120
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
}