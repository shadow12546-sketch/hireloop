/**
 * GridFS bucket setup for storing resume files directly in MongoDB.
 *
 * We use a single bucket named "resumes". Mongoose's underlying MongoDB
 * driver connection is reused, so this must be called AFTER connectDB()
 * has resolved (mongoose.connection.readyState === 1).
 */
const mongoose = require('mongoose');

const BUCKET_NAME = 'resumes';

let bucket = null;

function getResumeBucket() {
  if (bucket) return bucket;

  if (mongoose.connection.readyState !== 1) {
    throw new Error('Cannot create GridFS bucket before MongoDB connection is established');
  }

  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: BUCKET_NAME,
  });

  return bucket;
}

module.exports = { getResumeBucket, BUCKET_NAME };
