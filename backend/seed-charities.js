const mongoose = require('mongoose');
require('dotenv').config();

const charitySchema = new mongoose.Schema({
  name: String,
  description: String,
  url: String,
  totalContributionsRaised: { type: Number, default: 0 }
}, { timestamps: true });

const Charity = mongoose.model('Charity', charitySchema);

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error('MONGO_URI not found in .env'); process.exit(1); }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected ✅');

  await Charity.deleteMany({});
  
  await Charity.insertMany([
    {
      name: 'First Tee',
      description: 'Building character through golf. First Tee provides young people life-enhancing programs that build character, instill core values, and promote healthy choices through golf.',
      url: 'https://firsttee.org',
      totalContributionsRaised: 0
    },
    {
      name: 'Youth on Course',
      description: 'Giving kids access to golf for just $5 or less per round. Youth on Course partners with courses worldwide so every young person can experience the game.',
      url: 'https://youthoncourse.org',
      totalContributionsRaised: 0
    },
    {
      name: 'PGA HOPE',
      description: 'Introducing golf to Veterans with disabilities to enhance their physical, mental, social and emotional well-being through the power of the game.',
      url: 'https://www.pgareach.org/services/military',
      totalContributionsRaised: 0
    },
    {
      name: 'The R&A Foundation',
      description: 'Supporting golf development, sustainability, and inclusion worldwide. The R&A Foundation funds grassroots golf, education, and environmental initiatives globally.',
      url: 'https://www.randa.org',
      totalContributionsRaised: 0
    },
    {
      name: 'Golf Fore Africa',
      description: 'Transforming lives one well at a time. For every birdie made by participants, clean water is brought to communities in Africa through golf charity campaigns.',
      url: 'https://www.golforeAfrica.org',
      totalContributionsRaised: 0
    },
    {
      name: 'Golfers Against Cancer',
      description: 'Raising funds for cancer research through golf. Every round played and every score submitted contributes to funding life-saving cancer treatments and research.',
      url: 'https://www.golfiersagainstcancer.org',
      totalContributionsRaised: 0
    }
  ]);

  console.log('✅ 6 charities seeded successfully!');
  mongoose.disconnect();
}

seed().catch(e => {
  console.error('Seeding failed:', e.message);
  process.exit(1);
});
