import {Meteor} from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check';
export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({$or: [
        {private: {$ne: true}},
        {owner: this.userId},
      ],
    });
    return Tasks.find();
  });
}

Meteor.methods({
  'tasks.insert': function (text) {
    check(text, String);

    if(!this.userId){
      throw new error('not-authorized');
    }
    Tasks.insert({
      text,
      createdDate:new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },
  'tasks.remove': function (taskId) {
      check(taskId, String);
      const task = Tasks.findOne(taskId);
      if (task.private && task.owner !== this.userId) {
        // If the task is private, make sure only the owner can delete it
        throw new Meteor.Error('not-authorized');
      }
      Tasks.remove(taskId);
  },
  'tasks.setChecked': function (taskId,setChecked) {
      check(taskId, String);
      check(setChecked, Boolean);
      const task = Tasks.findOne(taskId);
      if (task.private && task.owner !== this.userId) {
        // If the task is private, make sure only the owner can delete it
        throw new Meteor.Error('not-authorized');
      }
      Tasks.update(taskId, {$set: {checked: setChecked}});
  },
  'tasks.setPrivate': function (taskId,setToPrivate) {
    check(taskId, String);
    check(setToPrivate, Boolean);

    const task = Tasks.findOne(taskId);

    if (task.owner!==this.userId) {
      throw new error('not-authorized');
    }
    Tasks.update(taskId, {$set: {private: setToPrivate}});
  },
});
