import "./style.css";

function InitLot(): number[][] {
  const lot: number[][] = [];

  for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
    const row: number[] = [];
    for (let colIndex = 0; colIndex < 10; colIndex++) {
      row.push(0);
    }
    lot.push(row);
  }

  return lot;
}

function DisplayLot(lot: number[][]): void {
  const seatMap = document.querySelector<HTMLDivElement>("#seat-map");
  if (!seatMap) {
    return;
  }

  let markup = '<div class="seat-grid" role="group" aria-label="Mapa de asientos">';
  markup += '<span class="axis-corner" aria-hidden="true"></span>';

  for (let colIndex = 0; colIndex < lot[0].length; colIndex++) {
    markup += `<span class="column-label" aria-hidden="true">C-${colIndex}</span>`;
  }

  for (let rowIndex = 0; rowIndex < lot.length; rowIndex++) {
    markup += `<span class="row-label" aria-hidden="true">F-${rowIndex}</span>`;
    for (let colIndex = 0; colIndex < lot[rowIndex].length; colIndex++) {
      const occupied = lot[rowIndex][colIndex] === 1;
      let isAdjacent = false;

      if (adjacentPair !== null) {
        for (let pairIndex = 0; pairIndex < adjacentPair.length; pairIndex++) {
          if (adjacentPair[pairIndex][0] === rowIndex && adjacentPair[pairIndex][1] === colIndex) {
            isAdjacent = true;
          }
        }
      }

      const seatClass = occupied ? "seat-button seat-button--occupied" : "seat-button seat-button--free";
      const adjacentClass = isAdjacent ? " seat-button--adjacent" : "";
      const stateLabel = occupied ? "ocupada" : "libre";
      const seatLabel = `Fila ${rowIndex}, columna ${colIndex}, ${stateLabel}`;

      markup += `<button class="${seatClass}${adjacentClass}" type="button" data-seat="true" data-row="${rowIndex}" data-col="${colIndex}" aria-label="${seatLabel}"><span>${occupied ? "X" : "L"}</span></button>`;
    }
  }

  markup += "</div>";
  seatMap.innerHTML = markup;
}

function ReserveSpace(lot: number[][], row: number, col: number): string {
  if (row < 0 || row >= lot.length || col < 0 || col >= lot[row].length) {
    return "La posición seleccionada no es válida.";
  }

  if (lot[row][col] === 1) {
    return "Plaza ya ocupada";
  }

  lot[row][col] = 1;
  return `Reservada F${row}C${col}`;
}

function CountSpaces(lot: number[][]): { free: number; occupied: number } {
  let free = 0;
  let occupied = 0;

  for (let rowIndex = 0; rowIndex < lot.length; rowIndex++) {
    for (let colIndex = 0; colIndex < lot[rowIndex].length; colIndex++) {
      if (lot[rowIndex][colIndex] === 0) {
        free++;
      } else {
        occupied++;
      }
    }
  }

  return { free, occupied };
}

function findadjacentPair(lot: number[][]): [number, number][] | null {
  for (let rowIndex = 0; rowIndex < lot.length; rowIndex++) {
    for (let colIndex = 0; colIndex < lot[rowIndex].length - 1; colIndex++) {
      if (lot[rowIndex][colIndex] === 0 && lot[rowIndex][colIndex + 1] === 0) {
        return [[rowIndex, colIndex], [rowIndex, colIndex + 1]];
      }
    }
  }

  return null;
}

const lot = InitLot();
let adjacentPair: [number, number][] | null = null;
let noticeType: "neutral" | "success" | "warning" = "neutral";
let noticeMessage = "Sala preparada para reservas.";

function renderApp(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) {
    return;
  }

  const spaces = CountSpaces(lot);
  const totalSeats = lot.length * lot[0].length;
  const occupancy = Math.round((spaces.occupied / totalSeats) * 100);

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="topbar-inner">
          <a class="brand" href="#" aria-label="Sala, inicio">
            <span class="brand-mark" aria-hidden="true">S</span>
            <span class="brand-name">SALA<span>.</span></span>
          </a>
          <div class="topbar-meta"><span class="meta-dot"></span>CONTROL DE SALA <span class="meta-divider"></span> 8 FILAS · 10 COLUMNAS</div>
        </div>
      </header>

      <main class="main-content">
        <section class="page-heading" aria-labelledby="page-title">
          <div>
            <p class="eyebrow">RESERVAS / SALA 01</p>
            <h1 id="page-title">Mapa de asientos</h1>
          </div>
          <div class="capacity-chip"><span>CAPACIDAD</span><strong>${totalSeats}</strong></div>
        </section>

        <div class="workspace">
          <section class="map-panel" aria-labelledby="room-title">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">DISTRIBUCIÓN</p>
                <h2 id="room-title">Sala principal</h2>
              </div>
              <button class="find-button" type="button" data-action="find-pair">
                <span class="find-button-mark" aria-hidden="true">2</span>
                Buscar pareja
              </button>
            </div>

            <div class="screen-marker" aria-label="Pantalla">
              <div class="screen-shape"></div>
              <span>PANTALLA</span>
            </div>

            <div class="seat-map-viewport">
              <div id="seat-map"></div>
            </div>

            <div class="legend" aria-label="Leyenda de asientos">
              <span class="legend-item"><span class="legend-swatch legend-swatch--free">L</span>Disponible</span>
              <span class="legend-item"><span class="legend-swatch legend-swatch--occupied">X</span>Ocupado</span>
              <span class="legend-item"><span class="legend-swatch legend-swatch--pair">2</span>Pareja encontrada</span>
            </div>
          </section>

          <aside class="status-panel" aria-label="Estado de la sala">
            <div class="status-panel-heading">
              <p class="eyebrow">RESUMEN</p>
              <h2>Ocupación</h2>
            </div>

            <div class="seat-counts">
              <div class="seat-count seat-count--free">
                <span class="count-label">Disponibles</span>
                <strong>${spaces.free}</strong>
              </div>
              <div class="seat-count seat-count--occupied">
                <span class="count-label">Ocupados</span>
                <strong>${spaces.occupied}</strong>
              </div>
            </div>

            <div class="occupancy-details">
              <div class="occupancy-copy"><span>Ocupación total</span><strong>${occupancy}%</strong></div>
              <div class="occupancy-track" role="progressbar" aria-label="Ocupación de la sala" aria-valuemin="0" aria-valuemax="${totalSeats}" aria-valuenow="${spaces.occupied}"><span style="width: ${occupancy}%"></span></div>
            </div>

            <div class="notice notice--${noticeType}" role="status" aria-live="polite">
              <span class="notice-indicator" aria-hidden="true"></span>
              <p>${noticeMessage}</p>
            </div>

            <div class="panel-footnote"><span class="footnote-rule"></span><span>SELECCIÓN ACTUALIZADA</span></div>
          </aside>
        </div>

        <footer class="page-footer"><span>GESTIÓN DE ASIENTOS</span><span>ÍNDICES DE FILA Y COLUMNA DESDE 0</span></footer>
      </main>
    </div>
  `;

  DisplayLot(lot);
}

renderApp();

const app = document.querySelector<HTMLDivElement>("#app");
if (app) {
  app.addEventListener("click", (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const seatButton = target.closest<HTMLButtonElement>("[data-seat]");
    if (seatButton) {
      const row = Number(seatButton.dataset.row);
      const col = Number(seatButton.dataset.col);
      const result = ReserveSpace(lot, row, col);
      adjacentPair = null;

      if (result === "Plaza ya ocupada") {
        noticeType = "warning";
        noticeMessage = `La plaza F-${row} C-${col} ya está ocupada.`;
      } else if (result === `Reservada F${row}C${col}`) {
        noticeType = "success";
        noticeMessage = `Reserva confirmada: F-${row} C-${col}.`;
      } else {
        noticeType = "warning";
        noticeMessage = result;
      }

      renderApp();
      return;
    }

    if (target.closest("[data-action='find-pair']")) {
      adjacentPair = findadjacentPair(lot);
      if (adjacentPair === null) {
        noticeType = "warning";
        noticeMessage = "No hay dos plazas libres contiguas.";
      } else {
        noticeType = "success";
        noticeMessage = `Pareja encontrada: F-${adjacentPair[0][0]} C-${adjacentPair[0][1]} y F-${adjacentPair[1][0]} C-${adjacentPair[1][1]}.`;
      }

      renderApp();
    }
  });
}

export {};
