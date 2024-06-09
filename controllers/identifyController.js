import Sequelize from 'sequelize';
import Contact from '../models/contact.js';

const identify = async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Either email or phoneNumber must be provided." });
  }

  try {
    // Find all contacts with the given email or phone number
    const contacts = await Contact.findAll({
      where: {
        [Sequelize.Op.or]: [{ email }, { phoneNumber: phoneNumber ? phoneNumber.toString() : null }]
      }
    });

    let primaryContact;
    let secondaryContacts = [];

    if (contacts.length === 0) {
      // No existing contacts, create a new primary contact
      const newContact = await Contact.create({
        email,
        phoneNumber:phoneNumber ? phoneNumber.toString() : null,
        linkPrecedence: 'primary'
      });

      return res.status(200).json({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email].filter(Boolean),
          phoneNumbers: [newContact.phoneNumber].filter(Boolean),
          secondaryContactIds: []
        }
      });
    } else {
      // Identify primary contact
      primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary') || contacts[0];

      // Identify secondary contacts
      secondaryContacts = contacts.filter(contact => contact.id !== primaryContact.id);

      // Update primary contact if necessary
      if (!primaryContact.email) primaryContact.email = email;
      if (!primaryContact.phoneNumber) primaryContact.phoneNumber = phoneNumber ? phoneNumber.toString() : null;
      await primaryContact.save();

      // Link all secondary contacts to the primary contact
      for (const contact of secondaryContacts) {
        if (contact.linkPrecedence === 'primary') {
          contact.linkPrecedence = 'secondary';
          contact.linkedId = primaryContact.id;
          await contact.save();
        }
      }

      // Create new secondary contacts if new information is provided
      if (email && !contacts.some(contact => contact.email === email)) {
        const newSecondaryContact = await Contact.create({
          email,
          phoneNumber:phoneNumber ? phoneNumber.toString() : null,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary'
        });
        secondaryContacts.push(newSecondaryContact);
      }

      if (phoneNumber && !contacts.some(contact => contact.phoneNumber === phoneNumber)) {
        const newSecondaryContact = await Contact.create({
          email,
          phoneNumber:phoneNumber ? phoneNumber.toString() : null,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary'
        });
        secondaryContacts.push(newSecondaryContact);
      }
    }

    // Collect all emails and phone numbers
    const emails = [primaryContact.email, ...secondaryContacts.map(contact => contact.email)].filter(Boolean);
    const phoneNumbers = [primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)].filter(Boolean);
    const secondaryContactIds = secondaryContacts.map(contact => contact.id);

    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: [...new Set(emails)],  // Unique emails
        phoneNumbers: [...new Set(phoneNumbers)],  // Unique phone numbers
        secondaryContactIds
      }
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default { identify };
