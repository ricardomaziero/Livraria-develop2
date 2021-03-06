import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DuplicateModalComponent } from 'src/app/Components/duplicate-modal/duplicate-modal.component';
import { Autor } from 'src/app/Shared/autor.model';
import { LivroServiceService } from 'src/app/Shared/livro-service.service';

@Component({
  selector: 'autores-create',
  templateUrl: './autorcreate.component.html',
  styleUrls: ['./autorcreate.component.css']
})
export class AutorcreateComponent implements OnInit {

  constructor(
    service: LivroServiceService,
    router: Router
  ) {
    this.router = router;
    this.service = service;
  }

  router: Router;
  public service: LivroServiceService;

  ngOnInit(): void {
  }

  public thisForm: NgForm | undefined;

  onSubmit(form: NgForm) {
    this.thisForm = form;

    let duplicatas: Autor[] = this.getDuplicates(form);
    if (duplicatas.length > 0) {
      let btnModal = document.getElementById("callModal") as HTMLButtonElement;
      let duplicateModal: DuplicateModalComponent = new DuplicateModalComponent(this.service);
      duplicateModal.setAutores(duplicatas, form);

      btnModal.click();
    }
    else {
      this.confirmCreate();
    }
  }

  confirmCreate() {
    this.setUpperCase();

    this.service.formDataAutor.id = 0;

    this.insertRecord(this.thisForm!);
  }

  insertRecord(form: NgForm) {

    this.service.postAutor().subscribe(
      response => {
        this.resetForm(form);

        this.router.navigate(["/autores-list"]);
      },
      err => { console.log(err); }
    );
  }

  resetForm(form: NgForm) {
    form.form.reset();
    this.service.formDataAutor = new Autor();
  }

  setUpperCase() {
    let palavras: string[] = this.thisForm!.controls["nome"].value.toString().split(" ");
    let novoNome: string = "";

    palavras.forEach(palavra => {
      let novaPalavra: string = "";
      if (palavra.length > 3 || palavras.indexOf(palavra) == 0) {
        novaPalavra = palavra[0].toLocaleUpperCase() + palavra.substring(1);
      }
      else {
        novaPalavra = palavra;
      }
      if (palavras.indexOf(palavra) > 0) {
        novoNome += " ";
      }
      novoNome += novaPalavra;
    });

    this.service.formDataAutor.nome = novoNome;
  }

  getDuplicates(form: NgForm): Autor[] {
    let hasDuplicate: boolean = false;
    //Vari??vel que receber?? os livros com mais de 49% de duplicatas
    let autoresRepetidos: Autor[] = [];

    let palavras: string[] = Array.from(form.controls["nome"].value.toString().toLocaleLowerCase().split(" ").filter(
      (p: string) => p.length >= 3
    ));

    //Para cada palavra do livro cadastrado
    palavras.forEach(palavra => {

      //Se houver um livro que inclua a palavra atual
      if (this.service.autoresList.some(aut =>
        aut.nome.toLocaleLowerCase().includes(
          palavra.toLocaleLowerCase()))) {

        //Armazena o livro encontrado com ao menos uma palavra repetida
        let autoresEncontrados: Autor[] = this.service.autoresList.filter(
          aut => aut.nome.toLocaleLowerCase().includes(palavra));

        //Para cada livro com ao menos uma palavra repetida
        autoresEncontrados.forEach(aut => {
          let duplicatas: number = 0;

          let autPalavras: string[] = aut.nome.toLocaleLowerCase().split(" ").filter(
            (p: string) => p.length >= 3
          );

          //Para cada palavra deste livro
          autPalavras.forEach(autPalavra => {
            //Se existe essa palavra no array de palavras
            if (palavras.includes(autPalavra)) {
              duplicatas++;
            }
          });

          //Se o n??mero de palavras repetidas deste livro >= 50%
          //do n??mero de palavras do livro cadastrado
          if (duplicatas >= autPalavras.length / 2 && !autoresRepetidos.includes(aut)) {
            autoresRepetidos.push(aut);
          }
        });

        if (autoresRepetidos.length > 0) {
          hasDuplicate = true;
        }
      }
    });

    if (hasDuplicate) {
      return autoresRepetidos;
    }
    else {
      return [];
    }
  }
}