import { Component, inject } from "@angular/core";
import { LoaderService } from "../../services/common/loader.service";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.scss'
})

export class Loader{
    loaderService = inject(LoaderService);
}