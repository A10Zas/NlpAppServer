const { NlpManager, ConversationContext } = require('node-nlp');
const wiki = require('wikipedia');
const manager = new NlpManager({ languages: ['en'] });
const context = new ConversationContext();

const { default: helmet } = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 6969;

const express = require('express');
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Define a function to extract entities
function extractEntities(utterance) {
  const entities = [];
  // Extract entities logic goes here
  // For simplicity, let's assume we just need the topic
  const topicMatch = utterance.match(/(?:tell me about|what is|give me information on) (.+)/i);
  if (topicMatch && topicMatch[1]) {
    const topic = topicMatch[1].trim();
    entities.push({ entity: 'topic', value: topic });
  }
  return entities;
}


async function loadModel() {
  //add document
  manager.addDocument('en', 'hi', 'greeting');
  manager.addDocument('en', 'hey', 'greeting');
  manager.addDocument('en', 'good morning', 'greeting');
  manager.addDocument('en', 'good afternoon', 'greeting');
  manager.addDocument('en', 'good day', 'greeting');
  manager.addDocument('en', 'yo', 'greeting');
  manager.addDocument('en', 'goodbye for now', 'greetings.bye');
  manager.addDocument('en', 'bye bye take care', 'greetings.bye');

  //add answers
  manager.addAnswer('en', 'greeting.hello', 'Hey there!  {{name}}');
  manager.addAnswer('en', 'greeting.bye', 'Till next time, {{name}}!');
  manager.addAnswer('en', 'greeting', 'Hey!');
  manager.addAnswer('en', 'greeting', 'Hey there');
  manager.addAnswer('en', 'greeting', 'hi');
  manager.addAnswer('en', 'greeting', 'yo whatsup');
  manager.addAnswer('en', 'greetings.bye', 'Till next time');
  manager.addAnswer('en', 'greetings.bye', 'see you soon!');

  // Add document for daily life conversations
  manager.addDocument('en', 'how are you', 'conversation');
  manager.addDocument('en', 'what\'s up', 'conversation');
  manager.addDocument('en', 'how\'s your day', 'conversation');
  manager.addDocument('en', 'what are you doing', 'conversation');
  manager.addDocument('en', 'what\'s new', 'conversation');
  manager.addDocument('en', `how's the weather today', 'conversation`);

  // Add answers for daily life conversations
  manager.addAnswer('en', 'conversation', 'I\'m good, thanks!');
  manager.addAnswer('en', 'conversation', 'Not much, just relaxing. How about you?');
  manager.addAnswer('en', 'conversation', 'My day is going well, thanks for asking!');
  manager.addAnswer('en', 'conversation', 'I\'m just here, ready to chat. What about you?');
  manager.addAnswer('en', 'conversation', 'I\'m a language model, always ready to help. What do you want to talk about?');
  manager.addAnswer('en', 'conversation', 'Not much, just the usual. How about you?');

  // Add document for asking for help
  manager.addDocument('en', 'help me', 'help');
  manager.addDocument('en', 'I need assistance', 'help');
  manager.addDocument('en', 'can you help me', 'help');
  manager.addDocument('en', 'I\'m stuck', 'help');
  manager.addDocument('en', 'please assist', 'help');

  // Add answers for asking for help
  manager.addAnswer('en', 'help', 'Of course! What do you need help with?');
  manager.addAnswer('en', 'help', 'Sure, I\'m here to assist. What can I do for you?');
  manager.addAnswer('en', 'help', 'I\'ll do my best to help you. What\'s the problem?');
  manager.addAnswer('en', 'help', 'Absolutely, I\'m here to assist you. What do you need support with?');
  manager.addAnswer('en', 'help', `No worries, I'm here to help. What's the issue?`);

  // Add document for expressing gratitude
  manager.addDocument('en', 'thank you', 'gratitude');
  manager.addDocument('en', 'thanks a lot', 'gratitude');
  manager.addDocument('en', 'appreciate it', 'gratitude');
  manager.addDocument('en', 'thanks so much', 'gratitude');
  manager.addDocument('en', 'thank you very much', 'gratitude');

  // Add answers for expressing gratitude
  manager.addAnswer('en', 'gratitude', 'You\'re welcome!');
  manager.addAnswer('en', 'gratitude', 'No problem, happy to help!');
  manager.addAnswer('en', 'gratitude', 'Glad I could assist. Anything else you need?');
  manager.addAnswer('en', 'gratitude', 'You\'re most welcome!');
  manager.addAnswer('en', 'gratitude', 'It was my pleasure!');

  // Add document for expressing emotions
  manager.addDocument('en', `I'm happy`, 'emotions.happy');
  manager.addDocument('en', 'feeling sad', 'emotions.sad');
  manager.addDocument('en', `I'm excited`, 'emotions.excited');
  manager.addDocument('en', 'feeling bored', 'emotions.bored');
  manager.addDocument('en', `I'm stressed`, 'emotions.stressed');

  // Add answers for expressing emotions
  manager.addAnswer('en', 'emotions.happy', `That's great to hear! What's making you happy?`);
  manager.addAnswer('en', 'emotions.sad', `I'm sorry to hear that. Do you want to talk about it?`);
  manager.addAnswer('en', 'emotions.excited', `Exciting! What's got you feeling that way?`);
  manager.addAnswer('en', 'emotions.bored', 'Boredom can be tough. Any ideas on how to make things more interesting?');
  manager.addAnswer('en', 'emotions.stressed', `I'm sorry to hear that. Take a deep breath, and let me know if there's anything I can do to help.`);

  // Add document for discussing hobbies
  manager.addDocument('en', 'what are your hobbies', 'hobbies');
  manager.addDocument('en', 'do you have any interests', 'hobbies');
  manager.addDocument('en', 'what do you like to do for fun', 'hobbies');

  // Add answers for discussing hobbies
  manager.addAnswer('en', 'hobbies', 'I don\'t have hobbies like humans, but I enjoy helping and learning new things!');


  // Add document for making plans
  manager.addDocument('en', `let's make plans`, 'plans');
  manager.addDocument('en', 'any suggestions for the weekend', 'plans');
  manager.addDocument('en', 'what should I do today', 'plans');

  // Add answers for making plans
  manager.addAnswer('en', 'plans', 'How about trying a new restaurant or going for a hike?');


  // Extend for specific responses
  manager.addDocument('en', 'I am fine', 'response');
  manager.addDocument('en', 'fine', 'response');
  manager.addDocument('en', 'not good', 'response');
  manager.addDocument('en', 'nothing much', 'response');
  manager.addDocument('en', 'yeah', 'response');

  // Add answers for specific responses
  manager.addAnswer('en', 'response', 'That\'s great to hear!');
  manager.addAnswer('en', 'response', 'Glad to know!');
  manager.addAnswer('en', 'response', 'I hope things get better for you.');
  manager.addAnswer('en', 'response', `If you need to talk about it, I'm here for you.`);

  // Add document for extracting information from Wikipedia
  manager.addDocument('en', 'Tell me about <topic>', 'wikipedia');
  manager.addDocument('en', 'Give me information on <topic>', 'wikipedia');

  // Train the model
  await manager.train();
  await manager.save(); // Save the trained model

  console.log('Model training completed.');
}


// Handle chatBot endpoint
app.get('/chatBot', async (req, res) => {
  const { question } = req.query;
  console.log('Received question:', question);

  try {
    const response = await manager.process('en', question);
    let answer = response.answer;



    if (response.intent == "wikipedia") {
      const entities = extractEntities(response.utterance);
      const topicEntity = entities.find(entity => entity.entity === 'topic');
      if (!topicEntity) {
        return "Sorry, I couldn't understand the topic.";
      }
      const topic = topicEntity.value;
      try {
        const page = await wiki.page(topic);
        console.log("page", page)
        //Response of type @Page object
        const summary = await page.summary();
        answer = summary.extract

        console.log(summary);
        //Response of type @wikiSummary - contains the intro and the main image
      } catch (error) {
        console.log("error", error);
        answer = `No page with given title exists : ${topic}`
        //=> Typeof wikiError
      }
    }

    res.status(200).json({ answer });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server after loading the model
loadModel()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error loading and training the model:', err);
  });
