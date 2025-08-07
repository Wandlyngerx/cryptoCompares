import {
  Component,
  inject,
  ModuleWithComponentFactories,
  signal,
} from '@angular/core';
import { Cripto } from './service/cripto';
import { map, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

@Component({
  selector: 'app-root',
  imports: [FormsModule, BaseChartDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  wss = inject(Cripto);
  moedas: any[] = [];
  coin1 = 'btcusdt';
  coin2 = 'ethusdt';
  realtime = false;
  private graficoInicialPronto = false;

  price1 = signal('...');
  price2 = signal('...');

  barChartData = {
    labels: ['Preço atual'],
    datasets: [
      {
        label: 'Moeda 1',
        data: [0],
        backgroundColor: '#42A5F5',
      },
      {
        label: 'Moeda 2',
        data: [0],
        backgroundColor: '#FFA726',
      },
    ],
  };

  barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  sub1?: Subscription;
  sub2?: Subscription;

  constructor() {
    this.carregarMoedas();
    this.iniciarWebSockets();
  }

  carregarMoedas() {
    this.wss
      .getSymbols()
      .pipe(
        map((res) => {
          this.moedas = res.symbols.map((s: any) => s.symbol.toLowerCase());
        })
      )
      .subscribe();
  }

  iniciarWebSockets() {
    this.sub1 = this.wss
      .getSocket(this.coin1)
      .subscribe((res) => this.atualizarPreco1(res.p));

    this.sub2 = this.wss
      .getSocket(this.coin2)
      .subscribe((res) => this.atualizarPreco2(res.p));
  }

  mudarMoeda1() {
    this.sub1?.unsubscribe();
    this.sub1 = this.wss
      .getSocket(this.coin1)
      .subscribe((res) => this.atualizarPreco1(res.p));
  }

  mudarMoeda2() {
    this.sub2?.unsubscribe();
    this.sub2 = this.wss
      .getSocket(this.coin2)
      .subscribe((res) => this.atualizarPreco2(res.p));
  }

  atualizarPreco1(preco: any) {
    if (!isNaN(parseFloat(preco))) {
      this.price1.set(preco);

      if (this.realtime) {
        const novoData = structuredClone(this.barChartData);
        novoData.datasets[0].data[0] = parseFloat(preco);
        this.barChartData = novoData;
      } else {
        this.atualizarGraficoInicial();
      }
    }
  }

  atualizarPreco2(preco: any) {
    if (!isNaN(parseFloat(preco))) {
      this.price2.set(preco);

      if (this.realtime) {
        const novoData = structuredClone(this.barChartData);
        novoData.datasets[1].data[0] = parseFloat(preco);
        this.barChartData = novoData;
      } else {
        this.atualizarGraficoInicial();
      }
    }
  }

  toggleRealtime() {
    this.realtime = !this.realtime;

    if (this.realtime) {
      // Atualiza gráfico com valores atuais
      const novoData = structuredClone(this.barChartData);
      novoData.datasets[0].data[0] = parseFloat(this.price1());
      novoData.datasets[1].data[0] = parseFloat(this.price2());
      this.barChartData = novoData;
    } else {
      this.graficoInicialPronto = true; // evita que o gráfico seja sobrescrito novamente
    }
  }

  private atualizarGraficoInicial() {
    if (this.graficoInicialPronto) return;

    const p1 = parseFloat(this.price1());
    const p2 = parseFloat(this.price2());

    if (!isNaN(p1) && !isNaN(p2)) {
      const novoData = structuredClone(this.barChartData);
      novoData.datasets[0].data[0] = p1;
      novoData.datasets[1].data[0] = p2;
      this.barChartData = novoData;

      this.graficoInicialPronto = true; // não atualiza mais até ativar realtime
    }
  }
}
