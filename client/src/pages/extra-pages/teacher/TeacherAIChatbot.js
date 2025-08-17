import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Card, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const TeacherAIChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'Bot', content: 'Hello, teacher! I’m Learnify’s AI here to help with course management or grading. What’s up? 📖' },
  ]);

  const faqs = [
    { q: 'How do I create a course?', a: 'Go to the Course Management page to create or edit courses.' },
    { q: 'How do I grade assignments?', a: 'Visit the Assessment & Grading page to view and grade student submissions.' },
    { q: 'How do I send announcements?', a: 'Use the Communication page to post announcements to your students.' },
  ];

  const handleMessageSubmit = async (values, { resetForm }) => {
    const userMessage = values.message.trim();
    if (!userMessage) return;

    // Display user message
    setMessages((prev) => [...prev, { sender: 'You', content: userMessage }]);

    try {
      // Send message to API
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, role: 'teacher' }),
      });
      const data = await response.json();

      // Display bot response
      setMessages((prev) => [
        ...prev,
        { sender: 'Bot', content: data.response || 'Sorry, something went wrong!' },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'Bot', content: 'Oops, I’m having trouble connecting. Try again!' },
      ]);
    }

    resetForm();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>AI Chatbot</Typography>
      <Card sx={{ p: 2, maxHeight: '50vh', overflowY: 'auto', mb: 3 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText primary={`${msg.sender}: ${msg.content}`} />
            </ListItem>
          ))}
        </List>
      </Card>
      <Formik
        initialValues={{ message: '' }}
        validationSchema={Yup.object({ message: Yup.string().required('Message is required') })}
        onSubmit={handleMessageSubmit}
      >
        {({ errors, touched }) => (
          <Form>
            <Field
              as={TextField}
              name="message"
              label="Ask the Chatbot"
              fullWidth
              error={touched.message && !!errors.message}
              helperText={touched.message && errors.message}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained">Send</Button>
          </Form>
        )}
      </Formik>
      <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>Frequently Asked Questions</Typography>
      {faqs.map((faq, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>{faq.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default TeacherAIChatbot;