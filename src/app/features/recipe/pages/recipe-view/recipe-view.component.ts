import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule, NgClass} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {RecipeService} from '../../../../shared/services/recipe.service';
import {FormsModule} from '@angular/forms';
import Swiper from 'swiper/bundle';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrl: './recipe-view.component.css',
  imports: [
    NgClass,
    CommonModule,
    FormsModule,
    SkeletonComponent
  ],
  standalone: true
})
export class RecipeViewComponent implements AfterViewInit, OnDestroy, OnInit {

  isLoading = true;

  public Math = Math;
  mainImageError = false;

  recipe: any;

  newComment = {
    user: '',
    rating: 5,
    comment: ''
  };

  @ViewChild('swiperContainer', {static: false}) swiperContainer!: ElementRef<HTMLDivElement>;
  private swiperInstance?: Swiper;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.recipeService.getRecipeById(id).subscribe(recipe => {
        this.recipe = recipe;
        this.preloadMainImage(this.recipe?.mainImage);

        this.isLoading = false;
        this.cdr.detectChanges();

        setTimeout(() => this.initSwiper(), 0);
      });
    }
  }

  preloadMainImage(url?: string) {
    if (!url) {
      this.mainImageError = true;
      return;
    }
    const img = new Image();
    img.onload = () => {
      this.mainImageError = false;
    };
    img.onerror = () => {
      this.mainImageError = true;
    };
    img.src = url;
  }

  get backgroundImage(): string {
    const placeholder = "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.25)), url('/assets/images/placeholder-main.jpg')";
    if (this.recipe?.mainImage && !this.mainImageError) {
      return `linear-gradient(0deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 40%), url('${this.recipe.mainImage}')`;
    }
    return placeholder;
  }

  submitComment() {
    if (!this.newComment.user.trim() || !this.newComment.comment.trim()) return;

    const newReview = {
      user: this.newComment.user.trim(),
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      rating: Number(this.newComment.rating),
      comment: this.newComment.comment.trim()
    };

    if (!this.recipe) {
      this.resetCommentForm();
      return;
    }

    this.recipe.reviews = Array.isArray(this.recipe.reviews) ? [...this.recipe.reviews, newReview] : [newReview];

    this.resetCommentForm();
  }

  resetCommentForm() {
    this.newComment = {user: '', rating: 5, comment: ''};
  }

  async initSwiper() {
    if (!this.recipe?.gallery?.length || !this.swiperContainer) return;

    if (this.swiperInstance?.destroy) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = undefined;
    }

    this.swiperInstance = new Swiper(this.swiperContainer.nativeElement, {
      loop: false,
      slidesPerView: 1,
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      a11y: {
        enabled: true
      },
      keyboard: true,
      breakpoints: {
        640: {slidesPerView: 2, spaceBetween: 20},
        768: {slidesPerView: 3, spaceBetween: 20},
        1024: {slidesPerView: 4, spaceBetween: 20}
      }
    });
  }

  async ngAfterViewInit() {
    await this.initSwiper();
  }

  ngOnDestroy() {
    if (this.swiperInstance?.destroy) {
      this.swiperInstance.destroy(true, true);
    }
  }

  removeImage(index: number) {
    if (!this.recipe?.gallery) return;
    this.recipe.gallery.splice(index, 1);

    if (this.swiperInstance) {
      this.swiperInstance.update();
    }
  }

  editRecipe(id?: string) {
    if (!id) return;
    this.router.navigate(['/recipes/edit', id]).then(() => {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    });
  }
}
