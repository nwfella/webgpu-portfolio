/** Static HTML/CSS fallback portfolio for browsers without WebGPU */
import { PROJECTS, SKILLS, PROFILE } from '../portfolio/data';

export function showFallbackPortfolio(): void {
  const container = document.getElementById('fallback-portfolio')!;
  container.classList.add('visible');

  container.innerHTML = `
    <div class="fallback-inner">
      <h1>${PROFILE.name}</h1>
      <div class="subtitle">${PROFILE.subtitle}</div>
      <p>${PROFILE.bio}</p>

      <h2 style="margin-top: 3rem; font-weight: 300; letter-spacing: 0.15em;">Projects</h2>
      ${PROJECTS.map(p => `
        <div class="project">
          <h3>${p.title} <span style="opacity:0.4; font-weight:300; font-size:0.8rem;">${p.subtitle}</span></h3>
          <p>${p.description}</p>
          <div class="skills" style="margin-top:0.3rem;">
            ${p.tags.map(t => `<span class="skill-tag">${t}</span>`).join('')}
          </div>
          ${p.link !== '#' ? `<a href="${p.link}" target="_blank" style="color:#a29bfe; font-size:0.8rem;">View →</a>` : ''}
        </div>
      `).join('')}

      <h2 style="margin-top: 3rem; font-weight: 300; letter-spacing: 0.15em;">Skills</h2>
      <div class="skills">
        ${SKILLS.map(s => `<span class="skill-tag" style="border-color:${s.color}33; background:${s.color}15;">${s.name}</span>`).join('')}
      </div>

      <div class="contact">
        ${PROFILE.github ? `<a href="${PROFILE.github}" target="_blank">GitHub ↗</a>` : ''}
      </div>

      <p style="margin-top:3rem; opacity:0.3; font-size:0.75rem;">
        WebGPU is not available in this browser. This static portfolio is the fallback.
      </p>
    </div>
  `;

  // Hide the WebGPU badge
  const badge = document.querySelector('.webgpu-badge') as HTMLElement;
  if (badge) badge.style.display = 'none';
}
