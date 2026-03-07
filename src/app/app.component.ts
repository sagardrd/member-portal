import { Component } from '@angular/core';
import { SearchComponent } from './search/search.component'; // Import this

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchComponent], // Add to imports array
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'member-portal';
}