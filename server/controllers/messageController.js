import Message from '../models/messageModel.js';
import Course from '../models/courseModel.js';

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, courseId } = req.body;
    if (!recipientId || !content?.trim() || !courseId) {
      return res.status(400).json({ error: 'Recipient, content, and course ID are required' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (
      course.teacher.toString() !== req.user.id &&
      !course.students.includes(req.user.id)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content: content.trim(),
      course: courseId,
    });
    await message.save();
    res.status(201).json({ message, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const sendAnnouncement = async (req, res) => {
  try {
    const { content, courseId } = req.body;
    if (!content?.trim() || !courseId) {
      return res.status(400).json({ error: 'Content and course ID are required' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can send announcements' });
    }
    const message = new Message({
      sender: req.user.id,
      content: content.trim(),
      course: courseId,
      isAnnouncement: true,
    });
    await message.save();
    res.status(201).json({ message, message: 'Announcement sent successfully' });
  } catch (err) {
    console.error('Send Announcement Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { courseId, recipientId } = req.query;
    let query = {};
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      if (
        course.teacher.toString() !== req.user.id &&
        !course.students.includes(req.user.id)
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }
      query.course = courseId;
    }
    if (recipientId) {
      query.$or = [
        { sender: req.user.id, recipient: recipientId },
        { sender: recipientId, recipient: req.user.id },
      ];
    } else if (courseId) {
      query.isAnnouncement = true;
    }
    const messages = await Message.find(query)
      .populate('sender', 'name')
      .populate('recipient', 'name');
    res.status(200).json({ messages });
  } catch (err) {
    console.error('Get Messages Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

export {
  sendMessage,
  sendAnnouncement,
  getMessages,
};