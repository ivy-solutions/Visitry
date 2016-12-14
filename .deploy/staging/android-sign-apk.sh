#!/usr/bin/env bash
cd $HOME/build/Visitry/android
#fetch signing keystore
aws s3 cp s3://visitry-build-info/signing/.keystore ./.keystore
#sign apk file
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
      release-unsigned.apk Visitry \
      -keystore ./.keystore \
      -storepass Visitry99
#remove old signed version
rm -rfv Visitry.apk
#pack new apk
$ANDROID_HOME/build-tools/23.0.2/zipalign 4 release-unsigned.apk Visitry.apk
