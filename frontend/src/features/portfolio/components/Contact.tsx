import type { PublicContact } from '../data/contact';

export function Contact({ contact, location }: { contact: PublicContact; location?: string }) {
  return (
    <section id="contact" tabIndex={-1} className="section section-contact">
      <div className="section-inner">
        <p className="eyebrow">06 / THE NEXT CHAPTER</p>
        <h2>Let's make a <em>meaningful impact.</em></h2>
        <div className="contact-bottom">
          <div><p>Interested in professional opportunities in water operations, quality and management.</p>
            {location && <p className="contact-location">{location}</p>}
            <div className="contact-links">
              {contact.email?.publicationApproved && <a href={`mailto:${contact.email.value}`}>{contact.email.value}</a>}
              {contact.phone?.publicationApproved && <a href={`tel:${contact.phone.international}`}>{contact.phone.display}</a>}
              {!contact.email && !contact.phone && <p>Contact information will be available here soon.</p>}
            </div>
          </div>
          <a href="#top" className="text-link">Back to top <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </section>
  );
}
