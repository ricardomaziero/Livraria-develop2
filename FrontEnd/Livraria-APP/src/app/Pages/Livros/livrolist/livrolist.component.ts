import { DetailsModalComponent } from './../../../Components/details-modal/details-modal.component';
import { LivroCreateComponent } from './../livrocreate/livrocreate.component';
import { Router } from '@angular/router';
import { DeleteModalComponent } from './../../../Components/delete-modal/delete-modal.component';
import { Livro } from 'src/app/Shared/livro.model';
import { LivroServiceService } from './../../../Shared/livro-service.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'livros-list',
  templateUrl: './livrolist.component.html',
  styleUrls: ['./livrolist.component.css']
})
export class LivroListComponent implements OnInit {

  constructor(
    public service: LivroServiceService,
    public router: Router
  ) {

  }


  ngOnInit(): void {
    this.service.refreshList();
    this.service.refreshAutores();
    this.service.refreshFornecedores();
  }

  populateForm(selectedRecord: Livro) {
    this.service.formData = Object.assign({}, selectedRecord);
  }

  postTests() {
    let tests: Livro[] = [];
    for (let i = 0; i < 10; i++) {
      tests.push(<Livro>{
        id: 0,
        titulo: "Teste " + (i),
        valor: Math.floor(Math.random() * 200.25),
        autorID: 1,
        fornecedorID: 1
      });
    }

    tests.forEach(livro => {
      this.service.formData = livro;
      this.service.postLivro().subscribe(
        res => {
          if (livro == tests[tests.length - 1]) {
            setTimeout(() => {
              this.service.refreshList();
            }, 500);
          }
        },
        err => { console.log("Erro:" + err); }
      );
      this.service.formData = new Livro();
    });
  }



  modalDeleteSingle(livro: Livro) {
    let delModal: DeleteModalComponent = new DeleteModalComponent(this.service);
    delModal.setLivro(livro);
  }

  modalDeleteMultiple(ids: number[]) {
    if (ids.length > 0) {
      let delModal: DeleteModalComponent = new DeleteModalComponent(this.service);
      delModal.setIdLivros(ids);
      (<HTMLButtonElement>document.getElementById("callDeleteModal")).click();
    }
  }

  openDetails(livro: Livro){
    this.populateForm(livro);
    let detailsModal = new DetailsModalComponent(this.service);
    detailsModal.setLivro();
  }


  valorEmReais(valor: string): string {
    return parseFloat(valor).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
  }


  selectedLivros: Livro[] = [];
  selecting: boolean = false;

  startSelection() {
    let btnSelecionar = document.getElementById("btnSelecionar")!;

    this.selecting = !this.selecting;

    if (this.selecting) {
      btnSelecionar.style.display = "none";
    }
    else {
      btnSelecionar.style.display = "block";
      btnSelecionar.innerHTML = "Selecionar";
      btnSelecionar.style.backgroundColor = "rgb(208, 238, 223)";
    }
  }

  cancelSelection() {
    let btnSelecionar = document.getElementById("btnSelecionar")!;

    this.selecting = false;
    btnSelecionar.style.display = "block";
    btnSelecionar.innerHTML = "Selecionar";
    btnSelecionar.style.backgroundColor = "rgb(208, 238, 223)";
  }

  selectAll() {
    let checks = document.getElementsByClassName("ckbSelect");
    Array.from(checks).forEach(item => {
      let check = item as HTMLInputElement;
      check.checked = true;
    });
  }

  setExcludeBtn() {
    let btnDelteSelected = document.getElementById("deleteSelected");
    if (this.getSelectedIds().length > 0) {
      if (btnDelteSelected?.classList.contains("disabled"))
        btnDelteSelected?.classList.remove("disabled");
    }
    else {
      if (!btnDelteSelected?.classList.contains("disabled"))
        btnDelteSelected?.classList.add("disabled");
    }
  }

  getSelectedIds(): number[] {
    let IDs: number[] = [];
    let checks = document.getElementsByClassName("ckbSelect") as HTMLCollectionOf<HTMLInputElement>;

    Array.from(checks).filter(c => c.checked)!.forEach(item => {
      let id = parseInt(item.value);
      IDs.push(id);
    });
    return IDs;
  }

  hoverImg(id: number){
    let img = document.getElementById("img-" + id)!;

    // img.classList.add("translate-middle");
    //img.style.transform = "translate(0,-120px)";
  }

  blurImg(id: number){
    let img = document.getElementById("img-" + id)!;
    // img.classList.remove("translate-middle");
    // img.classList.add("translate-middle-x");
  }

  confirmDelete(res: DeleteResponse){
    if(res.origin != "livro"){
      return;
    }

    if(res.ids.length > 1){
      this.deleteLivros(res.ids);
    }
    else{
      this.deleteLivro(res.ids[0]);
    }

    this.cancelSelection();
  }

  deleteLivro(id: number) {
    this.service.deleteLivro(id).subscribe(
      response => this.service.refreshList()
    );
  }

  deleteLivros(ids: number[]) {
    let i: number = 0;
    ids.forEach(id => {
      this.service.deleteLivro(id).subscribe(
        response =>{
          if(i == ids.length-1){this.service.refreshList();}
          i++;
        }
      );
    });
  }
}

class DeleteResponse{
  ids: number[];
  origin: string;
  constructor(ids: number[], origin: string){
    this.ids = ids;
    this.origin = origin;
  }
}
