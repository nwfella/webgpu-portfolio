/** Loading screen management */
export class LoadingScreen {
  private element: HTMLElement;
  private fill: HTMLElement;
  private status: HTMLElement;

  constructor() {
    this.element = document.getElementById('loading-screen')!;
    this.fill = document.getElementById('loader-fill')!;
    this.status = document.getElementById('loading-status')!;
  }

  setProgress(percent: number, message: string): void {
    this.fill.style.width = `${Math.min(100, percent)}%`;
    this.status.textContent = message;
  }

  hide(): void {
    this.element.classList.add('hidden');
  }
}
