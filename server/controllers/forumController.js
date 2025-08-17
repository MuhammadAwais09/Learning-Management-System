import mongoose from 'mongoose';
import Forum from '../models/forumModel.js';
import Course from '../models/courseModel.js';

const createForum = async (req, res) => {
  try {
    const { title, description, courseId } = req.body;
    if (!title?.trim() || !courseId) {
      return res.status(400).json({ error: 'Title and course ID are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can create forums' });
    }
    const forum = new Forum({
      title: title.trim(),
      description: description?.trim() || '',
      course: courseId,
      creator: req.user.id,
    });
    await forum.save();
    course.forums.push(forum._id);
    await course.save();
    res.status(201).json({ forum, message: 'Forum created successfully' });
  } catch (err) {
    console.error('Create Forum Error:', err);
    res.status(500).json({ error: err.message || 'Failed to create forum' });
  }
};

const getForumsByCourse = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (
      course.teacher.toString() !== req.user.id &&
      !course.students.includes(req.user.id)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const forums = await Forum.find({ course: req.params.courseId })
      .populate('creator', 'name')
      .populate('posts.author', 'name');
    res.status(200).json({ forums });
  } catch (err) {
    console.error('Get Forums Error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch forums' });
  }
};

const updateForum = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid forum ID' });
    }
    const { title, description } = req.body;
    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ error: 'Forum not found' });
    }
    if (forum.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the forum creator can update it' });
    }
    if (title?.trim()) forum.title = title.trim();
    if (description !== undefined) forum.description = description.trim() || '';
    await forum.save();
    res.status(200).json({ forum, message: 'Forum updated successfully' });
  } catch (err) {
    console.error('Update Forum Error:', err);
    res.status(500).json({ error: err.message || 'Failed to update forum' });
  }
};

const deleteForum = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid forum ID' });
    }
    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ error: 'Forum not found' });
    }
    if (forum.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the forum creator can delete it' });
    }
    await Course.updateOne(
      { _id: forum.course },
      { $pull: { forums: forum._id } }
    );
    await forum.deleteOne();
    res.status(200).json({ message: 'Forum deleted successfully' });
  } catch (err) {
    console.error('Delete Forum Error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete forum' });
  }
};

const addPost = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid forum ID' });
    }
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }
    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ error: 'Forum not found' });
    }
    const course = await Course.findById(forum.course);
    if (!course) {
      return res.status(404).json({ error: 'Associated course not found' });
    }
    if (
      course.teacher.toString() !== req.user.id &&
      !course.students.includes(req.user.id)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    forum.posts.push({ content: content.trim(), author: req.user.id });
    await forum.save();
    const updatedForum = await Forum.findById(req.params.id)
      .populate('creator', 'name')
      .populate('posts.author', 'name');
    res.status(201).json({ forum: updatedForum, message: 'Post added successfully' });
  } catch (err) {
    console.error('Add Post Error:', err);
    res.status(500).json({ error: err.message || 'Failed to add post' });
  }
};

export {
  createForum,
  getForumsByCourse,
  updateForum,
  deleteForum,
  addPost,
};