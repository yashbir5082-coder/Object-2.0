import { calculateAge } from './dateUtils';

const greetingTemplates = [
  {
    id: 'heartfelt',
    generate: (name, age, sender) => `Dearest ${name},

As you turn ${age} today, I want you to know just how incredibly special you are. Every single moment we've shared has been a treasure I hold close to my heart.

Your smile lights up the room, your laughter is the most beautiful melody, and your kindness touches everyone around you. The world is a better place because you're in it.

On this magical day, I wish you all the happiness your heart can hold, all the love the world has to offer, and all the dreams you've ever imagined coming true.

May this new year of your life be filled with adventures that take your breath away, moments that make you laugh until your cheeks hurt, and memories that you'll cherish forever.

Happy ${age}th Birthday, ${name}! Here's to celebrating the amazing person you are! 🎂✨

With all my love,
${sender} 💝`,
  },
  {
    id: 'fun',
    generate: (name, age, sender) => `Hey ${name}! 🎉

HAPPY ${age}th BIRTHDAY!! 🥳🎂🎈

Can you believe it?! Another trip around the sun, and somehow you keep getting MORE awesome! I didn't think that was even possible, but here you are, proving me wrong (as usual 😄).

Remember all those crazy moments we've had? Every single one of them is proof that life is just WAY more fun with you in it. You bring the party wherever you go!

So here's my birthday wish for you: May your ${age}th year be absolutely LEGENDARY. May you laugh so hard your stomach hurts, travel to places that blow your mind, and eat SO much cake! 🍰

You deserve the whole world and then some. Never stop being the incredible, one-of-a-kind person that you are.

Let's make this year the best one yet! 🚀

Cheers to you! 🥂
${sender} 🎊`,
  },
  {
    id: 'poetic',
    generate: (name, age, sender) => `My Dear ${name},

Like a star that graces the midnight sky,
Your presence makes the whole world shine.
${age} years of beautiful moments,
Each one more precious than wine.

Through seasons of joy and gentle rain,
You've bloomed into someone extraordinary.
A soul so pure, a heart so true,
Making every ordinary day legendary.

On this day that celebrates you,
May flowers bloom in your path,
May the wind carry your dreams to the stars,
And may love surround you like a warm bath.

${age} candles burning bright tonight,
Each one a wish from my heart to yours.
May every flame ignite a new adventure,
And open a thousand magical doors.

Happy Birthday, beautiful soul! ✨🌹

Forever yours,
${sender} 🦋`,
  },
  {
    id: 'emotional',
    generate: (name, age, sender) => `Dear ${name},

There are some people who walk into your life and change everything — you are one of those people for me.

Today, as you celebrate your ${age}th birthday, I find myself overwhelmed with gratitude. Grateful for every conversation we've had, every laugh we've shared, every tear we've wiped away, and every silent moment that spoke louder than words.

You have this incredible ability to make everyone around you feel seen, heard, and loved. It's a rare gift, and I want you to know that it has made an immeasurable difference in my life.

I've watched you grow, overcome challenges, and become this amazing person standing at ${age}. And I couldn't be more proud of you. You inspire me every single day.

So on your special day, I don't just wish you happiness — I wish you the courage to chase your wildest dreams, the wisdom to enjoy the little things, and the knowledge that you are deeply, truly loved.

Happy Birthday, ${name}. The world is brighter because you're in it. 🌟

All my love, always,
${sender} 💕`,
  },
  {
    id: 'short_sweet',
    generate: (name, age, sender) => `Happy ${age}th Birthday, ${name}! 🎂

You are one of the most amazing people I know. Your kindness, your strength, your beautiful spirit — it all inspires me more than you'll ever know.

Wishing you a day as wonderful as you are, filled with love, laughter, and all your favorite things.

Here's to ${age} more years of being absolutely incredible! 🌟

With love,
${sender} ❤️`,
  },
];

/**
 * Generate a birthday greeting.
 * @param {Object} options
 * @param {string} options.recipientName - Birthday person's name
 * @param {string} options.birthDate - Birth date (YYYY-MM-DD)
 * @param {string} options.senderName - Sender's name
 * @param {string} [options.templateId] - Optional template ID
 * @returns {{ text: string, templateId: string }}
 */
export function generateGreeting({ recipientName, birthDate, senderName, templateId }) {
  const age = calculateAge(birthDate);
  const template = templateId
    ? greetingTemplates.find((t) => t.id === templateId) || greetingTemplates[0]
    : greetingTemplates[0];

  return {
    text: template.generate(recipientName, age, senderName),
    templateId: template.id,
  };
}

/**
 * Get all available greeting templates with preview text.
 */
export function getGreetingTemplates() {
  return greetingTemplates.map((t) => ({
    id: t.id,
    name: t.id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    preview: t.generate('Name', 25, 'Sender').substring(0, 100) + '...',
  }));
}

export { greetingTemplates };
