import type { PublicContact } from '../data/contact';
import type { ReactNode } from 'react';
import { WaterArt } from '../../../shared/components/ui/WaterArt';

export function Contact({ contact, location, children }: { contact: PublicContact; location?: string; children?: ReactNode }) {
  return (
    <section id="contact" tabIndex={-1} className="section section-contact">
      <div className="section-inner">
        <p className="eyebrow">CONTACT / THE NEXT CHAPTER</p>
        {!children && <h2>Start a conversation.</h2>}
        <div className="contact-bottom">
          <div><p>Interested in professional opportunities in water operations, quality and management.</p>
            {location && <p className="contact-location">{location}</p>}
            <div className="contact-links">
              {contact.email?.publicationApproved && <a href={`mailto:${contact.email.value}`}>{contact.email.value}</a>}
              {contact.phone?.publicationApproved && <a href={`tel:${contact.phone.international}`}>{contact.phone.display}</a>}
            </div>
          </div>
          <a href="#top" className="text-link">Back to top <span aria-hidden="true">↑</span></a>
        </div>
        {children}
      </div>
      <WaterArt className="contact-water" />
    </section>
  );
}
