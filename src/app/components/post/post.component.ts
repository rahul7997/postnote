import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { faShareSquare, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnChanges {
  @Input() post;
  upvote = 0;
  downvote = 0;
  uid = null;

  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;
  faShareSquare = faShareSquare;

  constructor(private db: AngularFireDatabase,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getUser().subscribe((res) => {
      this.uid = res.uid;
    });
  }

  ngOnChanges(){
    this.updateVoteCounts();
  }

  upvotePost(){
    
    this.db.object(`posts/${this.post.id}/votes/${this.uid}`).set({
      upvote: 1
    });
  }

  downvotePost(){
    this.db.object(`posts/${this.post.id}/votes/${this.uid}`).set({
      downvote: 1
    });
  }

  updateVoteCounts(){
    if(this.post.votes){
      Object.values(this.post.votes).map((val: any) => {
        if(val.upvote){
          this.upvote += 1;
        }
        if(val.downvote){
          this.downvote += 1;
        }
      });
    }
  }

}
