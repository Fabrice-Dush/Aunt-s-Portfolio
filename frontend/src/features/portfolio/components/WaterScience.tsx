import { useState } from 'react';
import { SectionHeading } from '../../../shared/components/ui/SectionHeading';

const stages = [
  { title: 'Source-water assessment', label: 'Understand the source', icon: 'source', text: 'Assessing a source means identifying contamination hazards and changes in water quality. A catchment-to-consumer view helps determine which risks need control before and during treatment.' },
  { title: 'Treatment processes', label: 'Choose suitable barriers', icon: 'barrier', text: 'Treatment may include particle removal, filtration and disinfection. The combination depends on the source and contaminants; there is no single sequence suitable for every supply.' },
  { title: 'Quality testing and monitoring', label: 'Check the evidence', icon: 'test', text: 'Operational checks track whether control measures are working. Water-quality testing provides additional evidence of supply quality; neither a single sample nor appearance alone establishes continued safety.' },
  { title: 'Quality assurance and operational oversight', label: 'Review and respond', icon: 'review', text: 'Clear responsibilities, documented checks and corrective action help manage risks. Reviewing performance and independent surveillance support continuing improvement across the water supply.' },
] as const;

export function WaterScience() {
  const [active, setActive] = useState<number | null>(0);
  return <section id="water-science" tabIndex={-1} className="section section-science">
    <div className="section-inner">
      <div className="section-topline"><SectionHeading eyebrow="EXPLORE / WATER SCIENCE" title="The Science Behind" accent="Safe Water" /><p>From understanding a source to checking the controls: explore four connected perspectives on safe drinking water.</p></div>
      <p className="science-disclosure">A general educational explanation, not a description of Seraphine’s work or a particular facility. These are connected themes, not a fixed treatment sequence.</p>
      <div className="science-journey" data-stage={active}>
        <div className="science-visual" aria-hidden="true">
          <svg viewBox="0 0 480 480" fill="none">
            <defs>
              <radialGradient id="science-glass" cx=".3" cy=".28" r=".8"><stop stopColor="#efffff" stopOpacity=".95"/><stop offset=".32" stopColor="#b9f5ff" stopOpacity=".35"/><stop offset=".64" stopColor="#1696c9" stopOpacity=".5"/><stop offset=".85" stopColor="#063f70" stopOpacity=".85"/><stop offset="1" stopColor="#6deafa" stopOpacity=".8"/></radialGradient>
              <linearGradient id="science-stream" x1="50" y1="0" x2="430" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#1688bb"/><stop offset=".5" stopColor="#6ce8f2"/><stop offset="1" stopColor="#1688bb"/></linearGradient>
              <linearGradient id="science-reflection" x1="185" y1="170" x2="290" y2="355" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".8"/><stop offset="1" stopColor="#9beeff" stopOpacity="0"/></linearGradient>
            </defs>
            <ellipse cx="240" cy="407" rx="173" ry="34" fill="var(--accent-soft)" fillOpacity=".45"/>
            <ellipse cx="240" cy="407" rx="148" ry="23" stroke="url(#science-stream)"/><ellipse cx="240" cy="407" rx="107" ry="12" stroke="url(#science-stream)"/>
            <circle cx="240" cy="239" r="171" stroke="currentColor" strokeOpacity=".25"/>
            <ellipse cx="240" cy="247" rx="191" ry="81" transform="rotate(-28 240 247)" stroke="url(#science-stream)" strokeOpacity=".5"/>
            {['M240 68v38','M411 239h-70','M240 410v-36','M69 239h70'].map((d, i) => <path key={d} className={i === active ? 'science-connection is-active' : 'science-connection'} d={d} stroke="currentColor" strokeWidth="2"/>)}
            <path d="M240 78C213 123 139 193 139 273a101 101 0 0 0 202 0c0-80-74-150-101-195Z" fill="url(#science-glass)" stroke="url(#science-stream)" strokeWidth="2"/>
            <path d="M240 95c-28 43-82 103-84 171-1 41 22 72 58 86-29-44-13-87 8-133 18-41 24-85 18-124Z" fill="url(#science-reflection)"/>
            <path d="M148 288c56-39 117 39 183-5M155 307c61-30 110 29 169-4" stroke="url(#science-stream)" strokeWidth="3"/>
            <path d="M222 128c-24 34-57 83-59 119" stroke="#efffff" strokeOpacity=".8" strokeWidth="5" strokeLinecap="round"/>
            <path d="M323 256c12 48-14 95-56 105" stroke="#b9f7ff" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round"/>
            <g stroke="#c7faff" fill="#8fe6fb" fillOpacity=".25"><circle cx="209" cy="312" r="7"/><circle cx="267" cy="327" r="4"/><circle cx="284" cy="274" r="6"/></g>
            {[[240,68],[411,239],[240,410],[69,239]].map(([cx,cy], i) => <g key={i} className={i === active ? 'science-node is-active' : 'science-node'}><circle cx={cx} cy={cy} r="15" fill="var(--panel)" stroke="currentColor" strokeWidth="2"/><circle cx={cx} cy={cy} r="5" fill="currentColor"/></g>)}
          </svg>
          <p><strong>{active === null ? 'Four connected perspectives' : stages[active].label}</strong><span>Source · Treatment · Evidence · Oversight</span></p>
        </div>
        <div className="science-stages">
          {stages.map((stage, index) => <details className="science-stage" data-active={active === index} key={stage.icon} open={index === 0 ? true : undefined} onToggle={event => {
            if (event.currentTarget.open) setActive(index);
            else setActive(previous => previous === index ? null : previous);
          }}>
            <summary><span className="science-stage-label">{stage.label}</span><span className="science-stage-title">{stage.title}</span><span className="science-toggle" aria-hidden="true">+</span></summary>
            <div className="science-stage-body"><p>{stage.text}</p></div>
          </details>)}
        </div>
      </div>
    </div>
  </section>;
}
