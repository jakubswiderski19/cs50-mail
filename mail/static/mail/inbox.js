document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', () => send_mail(
    document.querySelector('#compose-recipients').value,
    document.querySelector('#compose-subject').value,
    document.querySelector('#compose-body').value
  ));

  // By default, load the inbox
  load_mailbox('inbox');
});

function create_mail_notification(email){
    const div = document.createElement("div");
    div.classList.add("border")
    div.classList.add("d-flex")
    div.classList.add("justify-content-center")
    div.classList.add("px-1")
    div.classList.add("py-2")
    if (email.read === false){
      div.classList.add("bg-white")
    } else {
      div.classList.add("bg-light")
    }

    const sender = document.createElement("p");
    sender.classList.add("fw-bold")
    sender.classList.add("me-3")
    sender.classList.add("my-auto")
    sender.innerText = email.sender
    div.appendChild(sender)

    const subject = document.createElement("p");
    subject.innerText = email.subject
    subject.classList.add("my-auto")
    div.appendChild(subject)

    const timestamp = document.createElement("p");
    timestamp.classList.add("text-muted")
    timestamp.classList.add("ms-auto")
    timestamp.classList.add("my-auto")
    timestamp.classList.add("me-2")
    timestamp.innerText = email.timestamp
    div.appendChild(timestamp)

    const archive_buttton = document.createElement("button");
    archive_buttton.classList.add("btn")
    if(email.archived){
      archive_buttton.classList.add("btn-outline-primary")
      archive_buttton.innerText = "Unarchive"
      archive_buttton.addEventListener("click",(e)=> archive_mail(e,email.id,false))
    } else{
      archive_buttton.classList.add("btn-outline-dark")
      archive_buttton.innerText = "Archive"
      archive_buttton.addEventListener("click",(e)=> archive_mail(e,email.id,true))
    }
    
    div.appendChild(archive_buttton)

    div.addEventListener("click",()=> show_mail(email.id))
    return div
}

function send_mail(recipients,subject,body) {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients, subject, body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
}

function archive_mail(e, id, bool){
  console.log(e);
  e.stopPropagation()
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: bool
    })
  })
  .then(result => {
    // Print result
    console.log(result);
    load_mailbox('inbox');
})
};

function show_mail(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    document.querySelector('#email-from').innerText = email.sender;
    document.querySelector('#email-subject').innerText = email.subject;
    document.querySelector('#email-timestamp').innerText = email.timestamp;
    document.querySelector('#email-body').innerText = email.body;
    document.querySelector('#email-to').innerHTML = ''
    email.recipients.forEach((recipient,idx,array) =>{
      if (idx === array.length - 1){ 
        document.querySelector('#email-to').innerHTML += recipient;
      } else {
        document.querySelector('#email-to').innerHTML += `${recipient}, `;
      }
    })

    document.querySelector('#email-reply').addEventListener('click',()=>reply_to_email(id))

    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

  });

}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply_to_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = email.sender;
    if (email.subject.startsWith("Re:")){
      document.querySelector('#compose-subject').value = email.subject;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  })
  
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      // ... do something else with emails ...
      emails.forEach(email => {
        document.querySelector('#emails-view').appendChild(create_mail_notification(email))
      });
  });
}