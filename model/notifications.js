/**
 * Created by sarahcoletti on 12/6/16.
 */
import { Class } from 'meteor/jagi:astronomy';
import { Enum } from 'meteor/jagi:astronomy';

const Notifications = new Mongo.Collection("notifications");

Notifications.allow({
  insert: function (userId, notification) {
    return false;
  },
  update: function (userId, notification, fields, modifier) {
    return false;
  },
  remove: function (userId, notification) {
    return false;
  }
});

const NotificationStatus = Enum.create({
  name: 'NotificationStatus',
  identifiers: ['FUTURE', 'SENT']
});

const Notification = Class.create({
  name: 'Notification',
  collection: Notifications,
  fields: {
    visitId: {type: String, immutable: true},
    notifyDate: {type: Date},
    title: {type: String},
    text: {type: String},
    toUserId: {type:String},
    status: { type: NotificationStatus },
    createdAt: {type: Date, immutable: true},
    updatedAt: {type: Date},
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'createdAt',
      hasUpdatedField: true,
      updatedFieldName: 'updatedAt'
    }
  }
});

export { NotificationStatus };
export { Notification};
export { Notifications};
