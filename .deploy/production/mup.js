module.exports = {
  servers: {
    one: {
      host: 'production.visitry.org',
      username: 'ubuntu',
      // for CircleCi:
      pem: '~/.ssh/id_rsa_09a9cf5e16242896187711f1a9242477',
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
    path: '/home/circleci/project',
    //for Sarah's machine
    //path: '/Users/sarahcoletti/WebstormProjects/Visitry',
    docker: {
      image: 'abernix/meteord:base', // use this image if using Meteor 1.4+
    },
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
      debug: false,
      cleanAfterBuild: true, // default
      buildLocation: '/home/circleci/project/.build', // defaults to /tmp/<uuid>
      //buildLocation: '/Users/sarahcoletti/build/Visitry', // defaults to /tmp/<uuid>
    },
    env: {
      PORT: 3000,
      ROOT_URL: 'https://production.visitry.org',
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
    version: '3.4.1',
    servers: {
      one: {},
    },
  },
};