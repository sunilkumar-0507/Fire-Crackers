import { BRAND, SHIPPING } from '@/constants';

/**
 * Policy and information pages — requirement 14.
 *
 * Structured data rather than five near-identical JSX files, so the pages
 * cannot drift apart in layout and a new one is a new entry rather than a new
 * component.
 *
 * Every figure here is read from the constants the shop already runs on
 * (`SHIPPING.freeAbove`, `BRAND.licence`) rather than typed again, because a
 * policy page that quotes a different delivery threshold from the checkout is
 * worse than no policy page at all.
 *
 * ---------------------------------------------------------------------------
 * A note for whoever maintains this
 *
 * The wording below is drafted to describe how this shop actually operates —
 * the delivery windows, the COD ceiling and the coupon rules are the ones the
 * code enforces. It is **not** a lawyer's work. Fireworks retail in India sits
 * under the Explosives Act 1884, the Explosive Rules 2008 and a series of
 * Supreme Court directions on permitted formulations and bursting hours, and
 * those change. Have the shop's own counsel read these pages before the site
 * goes live, and re-read them each season.
 * ---------------------------------------------------------------------------
 */

const rupees = (value) => `₹${value.toLocaleString('en-IN')}`;

export const POLICIES = [
  /* ------------------------------------------------------------------ */
  {
    slug: 'delivery',
    title: 'Delivery & collection',
    eyebrow: 'Policy',
    summary:
      'How your crackers reach you, what it costs, and how long it takes. Fireworks cannot travel by air or by ordinary courier, which shapes most of what follows.',
    updated: 'September 2026',
    sections: [
      {
        heading: 'Where we deliver',
        body: [
          'We deliver across Tamil Nadu and Kerala by licensed surface transport. We do not ship outside these two states, and we cannot ship abroad.',
          'Fireworks are classified explosives. They cannot be carried by air, by post, or by a standard parcel courier, so every order moves by a road carrier licensed to handle them. This is a legal restriction, not a choice we make.',
        ],
      },
      {
        heading: 'What delivery costs',
        list: [
          `Free on orders above ${rupees(SHIPPING.freeAbove)}.`,
          `${rupees(SHIPPING.localFee)} on orders below that.`,
          'Nothing at all if you choose to collect from the shop.',
        ],
      },
      {
        heading: 'How long it takes',
        body: [
          'Orders are despatched within 48 hours of confirmation. Delivery normally lands two to four working days after that, Sundays excluded.',
          'In the fortnight before Diwali the road network is at its busiest and carriers add a day or two. We will tell you when we confirm your order if we expect that to affect you.',
        ],
      },
      {
        heading: 'Collecting from the shop',
        body: [
          `You can collect any order from ${BRAND.address}. Collection orders are ready the next working day and are held at the counter for seven days.`,
          'Bring your order reference and the mobile number you booked with. We cannot release an order to anyone who has neither.',
        ],
      },
      {
        heading: 'When you receive it',
        list: [
          'Check the carton before the delivery person leaves.',
          'Refuse anything that arrives wet, crushed, or already opened.',
          'Tell us the same day if something is missing or damaged, quoting your order reference.',
        ],
      },
      {
        heading: 'Storing it until the night',
        body: [
          'Keep the carton somewhere cool, dry and off the floor. Away from the kitchen, away from any electrical point, and out of reach of children.',
          'Do not store fireworks in a bedroom, a stairwell, or anywhere that would block your way out of the building.',
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'cancellation-refund',
    title: 'Cancellation & refunds',
    eyebrow: 'Policy',
    summary:
      'When you can cancel, what comes back to you, and the one category of goods we cannot take back once it has left us.',
    updated: 'September 2026',
    sections: [
      {
        heading: 'Cancelling before despatch',
        body: [
          'You can cancel any order in full at no cost while it is still Pending, Confirmed or Processing. Call or message us with your order reference and we will stop it.',
          'Once an order reaches Ready it is with the carrier, or waiting at the counter, and cancellation is no longer automatic — talk to us and we will do what we can.',
        ],
      },
      {
        heading: 'Refunds',
        list: [
          'A cancelled order is refunded in full, to the method you paid with.',
          'Refunds are raised within two working days of the cancellation.',
          'Your bank may take a further five to seven working days to show it.',
          'Delivery charges are refunded when we cancel; they are not refunded on a delivery that was already attempted.',
        ],
      },
      {
        heading: 'What we cannot take back',
        body: [
          'We cannot accept a return of fireworks that have left our premises and been in your keeping. Once a box has been stored somewhere we cannot see, we have no way to verify it has been kept dry, kept cool and kept safe — and we will not re-sell something we cannot vouch for.',
          'This is a safety position, and it is not negotiable. It does not affect anything below.',
        ],
      },
      {
        heading: 'Damaged, wrong or missing items',
        body: [
          'If something arrives damaged, if we sent the wrong item, or if something on your order sheet is not in the box, tell us the same day with your order reference and a photograph.',
          'We will replace it on the next despatch, or refund that line in full — your choice. You will not be charged delivery either way.',
        ],
      },
      {
        heading: 'Orders we cancel',
        body: [
          'Occasionally we cancel an order ourselves: a line sells out between your order and our packing, a delivery address falls outside what a licensed carrier will serve, or a bulk order exceeds what we can legally transport in one consignment.',
          'We will always call you before doing this, and you are refunded in full.',
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'customer-information',
    title: 'Customer information',
    eyebrow: 'Before you order',
    summary:
      'Who we can sell to, how to order, how to pay, and how to reach a person about it. Worth two minutes before your first order.',
    updated: 'September 2026',
    sections: [
      {
        heading: 'Who we can sell to',
        body: [
          'We sell fireworks only to adults. By placing an order you confirm you are 18 or over.',
          'We may ask for proof of age on collection, and we will decline an order we believe is being placed for a minor.',
        ],
      },
      {
        heading: 'Placing an order',
        list: [
          'Add what you want to the basket and check out — you will see a full summary before anything is submitted.',
          'Every order gets a reference number in the shape AC12345678. Keep it; it is how we find your order.',
          'You can also send us your basket on WhatsApp if you would rather finish the conversation there.',
          'For 25 boxes or more, use the bulk enquiry form and we will quote you directly.',
        ],
      },
      {
        heading: 'Paying',
        list: [
          'UPI — GPay, PhonePe, Paytm, BHIM.',
          'Credit or debit card.',
          'Net banking.',
          'Cash on delivery, up to ₹5,000.',
        ],
      },
      {
        heading: 'Following your order',
        body: [
          'An order moves through Pending, Confirmed, Processing, Ready and Completed. You can see where yours has got to on the tracking page with your reference number and the mobile number you booked with.',
          'We message the number on the order when it is despatched.',
        ],
      },
      {
        heading: 'Prices',
        body: [
          'Every price on this site is inclusive of GST. The discount shown against each item is the gap between the printed MRP and what we charge — we make what we sell, so there is no distributor margin in the middle.',
          'Prices are for the 2026 season and can change. The price you see when you place an order is the price you pay.',
        ],
      },
      {
        heading: 'Talking to a person',
        list: [
          BRAND.phoneAlt ? `Phone: ${BRAND.phone} / ${BRAND.phoneAlt}` : `Phone: ${BRAND.phone}`,
          `WhatsApp: ${BRAND.whatsapp}`,
          ...(BRAND.email ? [`Email: ${BRAND.email}`] : []),
          `Hours: ${BRAND.hours}`,
          `Address: ${BRAND.address}`,
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'terms',
    title: 'Terms & conditions',
    eyebrow: 'Legal',
    summary:
      'The terms you accept when you order from us, and the law this trade sits under.',
    updated: 'September 2026',
    sections: [
      {
        heading: 'Who you are dealing with',
        body: [
          `${BRAND.name}, ${BRAND.address}.`,
          `${BRAND.licence}. GSTIN ${BRAND.gstin}.`,
          'Using this website, or placing an order through it, means you accept these terms.',
        ],
      },
      {
        heading: 'The law this sits under',
        body: [
          'Manufacture, storage, sale and transport of fireworks in India are governed by the Explosives Act 1884 and the Explosive Rules 2008, administered by PESO, together with directions issued from time to time by the Supreme Court of India and by state and local authorities.',
          'Those directions cover which formulations may be sold, and when fireworks may be burst. They change, sometimes at short notice and sometimes differently from one city to the next.',
        ],
      },
      {
        heading: 'Your responsibility',
        list: [
          'Check the rules in force where you live before you buy. Several cities restrict or ban fireworks outright, and some permit them only within set hours.',
          'You are responsible for complying with those rules. We cannot do it for you, and an order placed with us is not permission to use fireworks where they are prohibited.',
          'Follow the safety instructions printed on every product and on the card inside each carton.',
        ],
      },
      {
        heading: 'Orders and pricing',
        list: [
          'An order is an offer to buy. It is accepted when we confirm it, not when you submit it.',
          'We may decline an order — for stock, for delivery reach, or because we believe it breaches the rules above.',
          'We price every basket on our own server from our own catalogue, so a total shown to you is the total we charge.',
          'Obvious pricing errors are not binding on us. We will call you rather than silently cancel.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'Fireworks are dangerous goods. Once an order has been delivered or collected, how it is stored, handled and lit is in your hands.',
          'We are not liable for injury, loss or damage arising from use that departs from the printed safety instructions, from use by a minor, or from use where fireworks are prohibited.',
          'Nothing in these terms limits any liability that cannot be limited under Indian law, including liability for death or personal injury caused by our own negligence.',
        ],
      },
      {
        heading: 'Disputes',
        body: [
          'These terms are governed by the laws of India. Courts at Virudhunagar District, Tamil Nadu have jurisdiction.',
          'Talk to us first. Most things are settled with a phone call.',
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'privacy',
    title: 'Privacy',
    eyebrow: 'Legal',
    summary:
      'What we collect, why, and what we do not do. Short, because we do not collect much.',
    updated: 'September 2026',
    sections: [
      {
        heading: 'What we collect',
        list: [
          'Your name, mobile number and delivery address, so we can send you your order.',
          'Your email address, if you give us one, so we can send a receipt.',
          'What you ordered, and what it cost.',
          'Anonymous counts of what gets viewed and searched on this site.',
        ],
      },
      {
        heading: 'What we never collect',
        body: [
          'No card number, no UPI PIN, no CVV, no bank credential — none of it is requested by this site, passes through it, or is stored by it.',
          'We do not use advertising trackers, we do not run a third-party analytics tag, and we do not sell, rent or share your details with anyone for marketing.',
        ],
      },
      {
        heading: 'How the counting works',
        body: [
          'Product views, searches and basket activity are counted on our own server so we know what to stock more of. Those records carry a random identifier that lasts as long as your browser tab and is attached to nothing else — not your name, not your phone number, not your order.',
          'Because none of it identifies you, and none of it leaves our server, this site sets no tracking cookies and does not need to ask you to accept any.',
        ],
      },
      {
        heading: 'How long we keep things',
        list: [
          'Order records: as long as tax and explosives-trade record-keeping requires.',
          'Bulk enquiries and contact messages: until they are dealt with.',
          'Newsletter subscriptions: until you ask us to stop.',
          'Anonymous counts: a rolling window, then they age out.',
        ],
      },
      {
        heading: 'Asking us about your data',
        body: [
          // A data-access route has to stay reachable whether or not there is a
          // published email address, so the phone line is the one constant here.
          BRAND.email
            ? `Write to ${BRAND.email} or call ${BRAND.phone} and ask. We will tell you what we hold about you, correct it if it is wrong, and delete what we are not required to keep.`
            : `Call ${BRAND.phone}, or message us on WhatsApp at ${BRAND.whatsapp}, and ask. We will tell you what we hold about you, correct it if it is wrong, and delete what we are not required to keep.`,
        ],
      },
    ],
  },
];

export const findPolicy = (slug) => POLICIES.find((policy) => policy.slug === slug) ?? null;

/** The order they appear in the footer. */
export const POLICY_LINKS = POLICIES.map(({ slug, title }) => ({
  label: title,
  to: `/policies/${slug}`,
}));
