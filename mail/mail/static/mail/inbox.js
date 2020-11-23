document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function compose_reply(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.includes('Re:')) {
    document.querySelector('#compose-subject').value = email.subject;
  } else {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: `;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === "inbox") {
    inbox();
  } else if (mailbox === "sent") {
    sent();
  } else if (mailbox === "archive") {
    archive();
  }
}

function view_email(id) {
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(email => {

    if (email.sender !== emailAddress && email.read === false) {
      read_email(email.id);
    }

    let view = document.querySelector('#emails-view');
    view.innerHTML = '';

    let from = document.createElement("p");
    from.innerHTML = `<strong>From:</strong> ${email.sender}`;
    view.appendChild(from);

    let to = document.createElement("p");
    to.innerHTML = `<strong>To:</strong> ${email.recipients}`;
    view.appendChild(to);

    let timestamp = document.createElement("p");
    timestamp.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
    view.appendChild(timestamp);

    let hr = document.createElement("hr");
    view.appendChild(hr);

    let h3 = document.createElement("h3");
    h3.innerHTML = `${email.subject.charAt(0).toUpperCase() + email.subject.slice(1)}`;
    view.appendChild(h3);

    let body = document.createElement("p");
    body.innerHTML = `${email.body}`;
    view.appendChild(body);

    let btnRow = document.createElement("div");
    btnRow.classList.add("btn-group");
    btnRow.setAttribute("role", "button");
    view.appendChild(btnRow);

    let reply = document.createElement("button");
    reply.addEventListener('click', () => {
      compose_reply(email);
    });
    reply.classList.add("btn");
    reply.classList.add("btn-outline-primary");
    reply.innerHTML = "Reply";
    btnRow.appendChild(reply);

    if (email.sender !== emailAddress) {
      let archive = document.createElement("button");
      archive.addEventListener('click', () => {
        archive_email(email.id, email.archived);
        console.log("Archive Email");
        view_email(email.id);
        console.log("Archive 1 Done");
      });
      archive.classList.add("btn");
      archive.classList.add("btn-outline-primary");
      if (email.archived) {
        archive.innerHTML = "Unarchive";
      } else {
        archive.innerHTML = "Archive";
      }
      btnRow.appendChild(archive);
    }

  })
}

function inbox() {
  fetch('/emails/inbox', {
    method: 'GET'
  })
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    console.log("Inbox");

    listView("New", emails);
  });
}

function sent() {
  fetch('/emails/sent', {
    method: 'GET'
  })
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    console.log("Sent");

    listView("Sent", emails);
  });
}

function archive() {
  fetch('/emails/archive', {
    method: 'GET'
  })
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    console.log("Archive");

    listView("Archived", emails);
  });
}

function read_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
  console.log("Read Email");
  view_email(id);
  console.log("Read Done");
}

function archive_email(id, archived) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !archived
    })
  });
  console.log("Archive Email");
  view_email(id);
  console.log("Archive Done");
}

function send_mail() {
  let rec = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  console.log("form submitted");

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: rec,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
  });
  load_mailbox('sent');
}

function listView(mailbox, emails) {
  let view = document.querySelector('#emails-view');

  if (emails.length === 0) {
    let none = document.createElement("h4");
    none.classList.add("my-4");
    none.innerHTML = `No ${mailbox} Messages`;
    view.appendChild(none);
  } else {
    for (i in emails) {

      email = emails[i];

      let card = document.createElement("button");
      card.addEventListener('click', function() {
        console.log("View Email");
        view_email(email.id);
        console.log("View Email Done");
      });
      card.setAttribute("id", `${email.id}`);
      card.classList.add("card");
      card.classList.add("w-100");
      card.classList.add("text-left");
      card.classList.add("my-3");
      if (!email.read) {
        card.classList.add("bg-white");
      } else {
        card.classList.add("bg-light")
      }
      view.appendChild(card);

      let c_body = document.createElement("div");
      c_body.classList.add("card-body");
      card.appendChild(c_body);

      let subject = document.createElement("h4");
      subject.classList.add("card-title");
      subject.innerHTML = `Subject: ${email.subject}`;
      c_body.appendChild(subject);

      let sender = document.createElement("h6");
      sender.classList.add("card-text");
      sender.innerHTML = `From: ${email.sender}`;
      c_body.appendChild(sender);

      let txt = document.createElement("p");
      txt.classList.add("card-text");
      txt.innerHTML = `Message: ${email.body.slice(0, 50)}`;
      c_body.appendChild(txt);

      let time = document.createElement("p");
      time.classList.add("card-text");
      time.classList.add("text-primary");
      time.innerHTML = `Date Sent: ${email.timestamp}`;
      c_body.appendChild(time);
    }
  }
  
}