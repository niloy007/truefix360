export type FaqItem = {
  question: string;
  answer: string;
  links?: { href: string; label: string }[];
};

export type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const homepageFaqs: FaqItem[] = [
  {
    question: "What does TrueFix360 do?",
    answer:
      "TrueFix360 provides professional property preservation and property maintenance. Preservation work protects vacant, foreclosed, REO, and otherwise at-risk properties. Maintenance supports occupied residential and commercial properties with repair and ongoing service coordination.",
  },
  {
    question: "What areas does TrueFix360 cover?",
    answer:
      "TrueFix360 coordinates work through a growing field network across active U.S. service markets. Coverage continues to expand. Share the property location so local capability can be reviewed.",
    links: [{ href: "/coverage", label: "Explore Our Coverage" }],
  },
  {
    question: "Does TrueFix360 provide nationwide service?",
    answer:
      "TrueFix360 does not publish a nationwide or 50-state coverage claim on this website. Service is coordinated through an expanding network in active markets, and availability depends on location, service type, trade, scope, and field resources.",
    links: [{ href: "/coverage", label: "View Coverage" }],
  },
  {
    question: "How can clients see their service requests?",
    answer:
      "Existing clients can sign in through the TrueFix360 client portal. A full request-tracking dashboard is not connected on this website yet. Access is provisioned by the TrueFix360 team.",
    links: [{ href: "/login", label: "Client Login" }],
  },
  {
    question: "How can contractors become TrueFix360 vendors?",
    answer:
      "Independent contractors and service companies can submit a vendor application. The team reviews business details, services, coverage, and insurance information. Submitting an application does not guarantee assignments or work volume.",
    links: [{ href: "/vendors/apply", label: "Apply to Join" }],
  },
  {
    question: "Can residents request repair service?",
    answer:
      "Yes. Residents and property owners can request maintenance or repair service through the quote form. Include the location, a description of the issue, and photos when available. Submitting a request does not constitute acceptance of work or final pricing.",
    links: [{ href: "/get-a-quote", label: "Request a Repair Quote" }],
  },
];

const vendorJoin: FaqItem = {
  question: "How can contractors join the vendor network?",
  answer:
    "Qualified independent contractors and service companies can submit a vendor application. The team reviews business details, services, coverage, and insurance information during onboarding.",
};

const vendorGuarantee: FaqItem = {
  question: "Does submitting a vendor application guarantee work?",
  answer:
    "No. Submitting an application does not guarantee assignments or work volume. Applications are reviewed, and any work depends on qualification, coverage needs, and client demand.",
};

const residentContact: FaqItem = {
  question: "How are residents contacted for scheduled maintenance?",
  answer:
    "When a property manager or client requests occupied-property work, TrueFix360 or the assigned technician may contact the resident to confirm access, timing, and appointment details. TrueFix360 does not own or manage the lease.",
};

export const faqCategories: FaqCategory[] = [
  {
    id: "services",
    title: "Services",
    items: [
      homepageFaqs[0],
      {
        question: "Do you handle both occupied and vacant properties?",
        answer:
          "Yes. Preservation work is typically associated with vacant or at-risk properties. Maintenance work supports occupied residential and commercial properties, including resident-facing appointments when a client requests it.",
      },
      {
        question: "Do you provide emergency service?",
        answer:
          "TrueFix360 can coordinate urgent or after-hours work when a client requests it and a suitable field resource is available. Emergency response depends on location, trade, and timing.",
      },
    ],
  },
  {
    id: "coverage",
    title: "Coverage",
    items: [homepageFaqs[1], homepageFaqs[2]],
  },
  {
    id: "clients",
    title: "Clients",
    items: [
      homepageFaqs[3],
      {
        question: "Can property managers partner with TrueFix360?",
        answer:
          "Yes. TrueFix360 is built for teams responsible for properties, including property managers, asset managers, investors, landlords, and preservation companies.",
      },
    ],
  },
  {
    id: "vendors",
    title: "Vendors",
    items: [
      homepageFaqs[4],
      vendorJoin,
      vendorGuarantee,
    ],
  },
  {
    id: "residents",
    title: "Residents",
    items: [
      homepageFaqs[5],
      residentContact,
      {
        question: "Does TrueFix360 manage my lease or rent?",
        answer:
          "No. TrueFix360 may be asked to complete maintenance requested by a property manager or property owner. Lease, rent, and occupancy questions should go to the property contact listed on your lease or resident portal.",
      },
    ],
  },
  {
    id: "quotes",
    title: "Quotes",
    items: [
      {
        question: "How do I request service?",
        answer:
          "Use the Get a Quote form with the property location, occupancy status, and a description of the work. Submitting a request does not constitute acceptance of work or final pricing.",
      },
      {
        question: "Is a submitted quote request a work order?",
        answer:
          "No. Submitting a request does not constitute acceptance of work or final pricing. The team reviews the details and follows up on next steps.",
      },
    ],
  },
];

export const vendorFaqs: FaqItem[] = [
  vendorJoin,
  vendorGuarantee,
  homepageFaqs[4],
  {
    question: "When are documents like a W-9 collected?",
    answer:
      "The initial application collects business and coverage details. Sensitive tax documents and insurance certificates are requested later during secure onboarding rather than stored in this public website form.",
  },
];

export const residentFaqs: FaqItem[] = [
  homepageFaqs[5],
  residentContact,
  {
    question: "Why might TrueFix360 contact me?",
    answer:
      "If your property manager or the property owner requested maintenance, TrueFix360 may reach out to schedule access, confirm appointment details, or share technician arrival information.",
  },
];
