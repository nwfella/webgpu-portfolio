/** HTML overlay HUD — project cards, skill tooltips */
import { PROJECTS, SKILLS, PROFILE } from '../portfolio/data';

export class HUD {
  private container: HTMLElement;
  private cardContainer: HTMLElement;
  private infoPanel: HTMLElement | null = null;

  constructor() {
    this.container = document.getElementById('ui-overlay')!;
    this.cardContainer = document.createElement('div');
    this.cardContainer.id = 'hud-cards';
    this.cardContainer.style.cssText = `
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      display: flex; gap: 0.5rem; z-index: 20;
    `;
    this.container.appendChild(this.cardContainer);

    this.createProjectDots();
    this.createInfoPanel();
  }

  private createProjectDots(): void {
    PROJECTS.forEach((p, i) => {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 40px; height: 40px; border-radius: 50%;
        background: ${p.color}22; border: 1px solid ${p.color}44;
        cursor: pointer; transition: all 0.3s ease;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.6rem; color: ${p.color}; opacity: 0.6;
        pointer-events: auto;
      `;
      dot.textContent = `${i + 1}`;
      dot.addEventListener('mouseenter', () => {
        dot.style.background = `${p.color}44`;
        dot.style.borderColor = p.color;
        dot.style.opacity = '1';
        dot.style.transform = 'scale(1.15)';
        this.showProjectInfo(i);
      });
      dot.addEventListener('mouseleave', () => {
        dot.style.background = `${p.color}22`;
        dot.style.borderColor = `${p.color}44`;
        dot.style.opacity = '0.6';
        dot.style.transform = 'scale(1)';
        this.hideProjectInfo();
      });
      dot.addEventListener('click', () => {
        if (p.link !== '#') window.open(p.link, '_blank');
      });
      this.cardContainer.appendChild(dot);
    });
  }

  private createInfoPanel(): void {
    this.infoPanel = document.createElement('div');
    this.infoPanel.id = 'hud-info';
    this.infoPanel.style.cssText = `
      position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%);
      background: rgba(10,10,18,0.85); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
      padding: 1rem 1.5rem; max-width: 380px; width: 90%;
      opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
      transform: translateX(-50%) translateY(10px);
      pointer-events: none; z-index: 19;
    `;
    this.container.appendChild(this.infoPanel);
  }

  private showProjectInfo(index: number): void {
    if (!this.infoPanel) return;
    const p = PROJECTS[index];
    this.infoPanel.innerHTML = `
      <div style="font-size: 0.7rem; opacity: 0.5; margin-bottom: 0.25rem;">${p.subtitle}</div>
      <div style="font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem;">${p.title}</div>
      <div style="font-size: 0.8rem; opacity: 0.7; line-height: 1.5; margin-bottom: 0.5rem;">${p.description}</div>
      <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
        ${p.tags.map(t => `<span style="font-size: 0.65rem; background: ${p.color}22; border: 1px solid ${p.color}33; padding: 0.15rem 0.5rem; border-radius: 3px;">${t}</span>`).join('')}
      </div>
    `;
    this.infoPanel.style.opacity = '1';
    this.infoPanel.style.transform = 'translateX(-50%) translateY(0)';
  }

  private hideProjectInfo(): void {
    if (!this.infoPanel) return;
    this.infoPanel.style.opacity = '0';
    this.infoPanel.style.transform = 'translateX(-50%) translateY(10px)';
  }
}
