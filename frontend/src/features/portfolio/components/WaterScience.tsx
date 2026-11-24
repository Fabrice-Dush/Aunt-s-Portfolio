import { useState } from 'react';
import { SectionHeading } from '../../../shared/components/ui/SectionHeading';

const stages = [
  { title: 'Source-water assessment', label: 'Understand the source', icon: 'source', text: 'Assessing a source means identifying contamination hazards and changes in water quality. A catchment-to-consumer view helps determine which risks need control before and during treatment.' },
  { title: 'Treatment processes', label: 'Choose suitable barriers', icon: 'barrier', text: 'Treatment may include particle removal, filtration and disinfection. The combination depends on the source and contaminants; there is no single sequence suitable for every supply.' },
  { title: 'Quality testing and monitoring', label: 'Check the evidence', icon: 'test', text: 'Operational checks track whether control measures are working. Water-quality testing provides additional evidence of supply quality; neither a single sample nor appearance alone establishes continued safety.' },
  { title: 'Quality assurance and operational oversight', label: 'Review and respond', icon: 'review', text: 'Clear responsibilities, documented checks and corrective action help manage risks. Reviewing performance and independent surveillance support continuing improvement across the water supply.' },
] as const;

export function WaterScience() {
  const [active, setActive] = useState(0);
  return <section id="water-science" tabIndex={-1} className="section section-science">
    <div className="section-inner">
      <div className="section-topline"><SectionHeading eyebrow="EXPLORE / WATER SCIENCE" title="The Science Behind" accent="Safe Water" /><p>From understanding a source to checking the controls: explore four connected perspectives on safe drinking water.</p></div>
      <p className="science-disclosure">A general educational explanation, not a description of Seraphine’s work or a particular facility. These are connected themes, not a fixed treatment sequence.</p>
      <div className="science-journey" data-stage={active}>
        <div className="science-visual" aria-hidden="true">
          <svg viewBox="0 0 480 480" fill="none">
            <defs><radialGradient id="science-glass" cx=".35" cy=".28" r=".8"><stop stopColor="#efffff" stopOpacity=".9"/><stop offset=".4" stopColor="#59d4ef" stopOpacity=".25"/><stop offset="1" stopColor="#0873a8" stopOpacity=".65"/></radialGradient><linearGradient id="science-stream" x1="50" y1="0" x2="430" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#1688bb"/><stop offset=".5" stopColor="#6ce8f2"/><stop offset="1" stopColor="#1688bb"/></linearGradient></defs>
            <ellipse cx="240" cy="407" rx="148" ry="23" stroke="url(#science-stream)"/><ellipse cx="240" cy="407" rx="107" ry="12" stroke="url(#science-stream)"/>
            <circle cx="240" cy="239" r="171" stroke="currentColor" strokeOpacity=".3" strokeDasharray="3 9"/>
            <path d="M240 78C213 123 139 193 139 273a101 101 0 0 0 202 0c0-80-74-150-101-195Z" fill="url(#science-glass)" stroke="url(#science-stream)" strokeWidth="2"/>
            <path d="M148 288c56-39 117 39 183-5M155 307c61-30 110 29 169-4" stroke="url(#science-stream)" strokeWidth="3"/>
            <path d="M222 128c-24 34-57 83-59 119" stroke="#efffff" strokeOpacity=".8" strokeWidth="5" strokeLinecap="round"/>
            {[[240,68],[411,239],[240,410],[69,239]].map(([cx,cy], i) => <g key={i} className={i === active ? 'science-node is-active' : 'science-node'}><circle cx={cx} cy={cy} r="15" fill="var(--panel)" stroke="currentColor" strokeWidth="2"/><circle cx={cx} cy={cy} r="5" fill="currentColor"/></g>)}
          </svg>
          <p>Source · Treatment · Evidence · Oversight</p>
        </div>
        <div className="science-stages">
          {stages.map((stage, index) => <details className="science-stage" key={stage.icon} open={index === 0 ? true : undefined} onToggle={event => { if (event.currentTarget.open) setActive(index); }}>
            <summary><span className="science-stage-label">{stage.label}</span><span className="science-stage-title">{stage.title}</span><span className="science-toggle" aria-hidden="true">+</span></summary>
            <div className="science-stage-body"><p>{stage.text}</p></div>
          </details>)}
        </div>
      </div>
      <div className="science-sources"><span>Explore the evidence</span><a href="https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health/water-safety-and-quality/water-safety-planning">WHO: water safety planning</a><a href="https://www.cdc.gov/drinking-water/about/how-water-treatment-works.html">CDC: how water treatment works</a></div>
    </div>
  </section>;
}
