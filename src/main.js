import { createClient } from '@supabase/supabase-js';
import './style.css'; 

const SUPABASE_URL = 'https://enowxmavjeajqapgeqfo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub3d4bWF2amVhanFhcGdlcWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjM0ODksImV4cCI6MjA5NjQzOTQ4OX0.vUxtJbmSpMPLO0CTG01TrYPyDtmL4Zvqg-ny-JSPhwo';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


let isLoggedIn = false;
const articlesContainer = document.getElementById('articles-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const addBtn = document.getElementById('add-btn');


const modal = document.getElementById('article-modal');
const form = document.getElementById('article-form');
const cancelBtn = document.getElementById('cancel-btn');
const modalTitle = document.getElementById('modal-title');

async function checkSession() {
  const { data } = await supabase.auth.getSession();
  isLoggedIn = !!data?.session;


  if (isLoggedIn) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
}

async function fetchArticles() {
  const { data, error } = await supabase
    .from('article')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Błąd pobierania:', error);
    articlesContainer.innerHTML = '<p class="text-red-500">Błąd ładowania artykułów.</p>';
    return;
  }

  renderArticles(data);
}

function renderArticles(articles) {
  articlesContainer.innerHTML = '';

  if (articles.length === 0) {
    articlesContainer.innerHTML = '<p class="text-gray-500 col-span-full">Brak artykułów. Bądź pierwszym, który coś napisze!</p>';
    return;
  }

  articles.forEach(article => {
    const date = new Date(article.created_at).toLocaleDateString('pl-PL', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const card = document.createElement('article');
    card.className = 'bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow';
    
    let htmlContent = `
      <h2 class="text-xl font-bold text-gray-900 mb-1">${escapeHTML(article.title)}</h2>
      ${article.subtitle ? `<h3 class="text-md text-gray-600 mb-3">${escapeHTML(article.subtitle)}</h3>` : ''}
      <div class="text-sm text-gray-500 mb-4 flex items-center gap-2">
        <span class="font-medium text-blue-600">${escapeHTML(article.author)}</span> • <span>${date}</span>
      </div>
      <p class="text-gray-700 whitespace-pre-wrap flex-grow">${escapeHTML(article.content)}</p>
    `;


    if (isLoggedIn) {
      htmlContent += `
        <div class="mt-4 pt-4 border-t flex justify-end gap-2">
          <button class="edit-btn text-sm px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded transition-colors" data-id="${article.id}">Edytuj</button>
          <button class="delete-btn text-sm px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors" data-id="${article.id}">Usuń</button>
        </div>
      `;
    }

    card.innerHTML = htmlContent;
    articlesContainer.appendChild(card);
  });


  attachCardEvents(articles);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}



logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  await init(); 
});


loginBtn.addEventListener('click', () => {
  window.location.href = './login/index.html'; 
});

addBtn.addEventListener('click', () => {
  if (!isLoggedIn) {
    window.location.href = './login/index.html'; 
  } else {
    openModal();
  }
});


cancelBtn.addEventListener('click', closeModal);


form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('article-id').value;
  
  const articleData = {
    title: document.getElementById('title').value,
    subtitle: document.getElementById('subtitle').value,
    author: document.getElementById('author').value,
    content: document.getElementById('content').value,
    created_at: new Date().toISOString() 
  };

  if (id) {
    const { error } = await supabase.from('article').update(articleData).eq('id', id);
    if (error) alert('Błąd edycji: ' + error.message);
  } else {
    const { error } = await supabase.from('article').insert([articleData]);
    if (error) alert('Błąd dodawania: ' + error.message);
  }

  closeModal();
  fetchArticles(); 
});


function attachCardEvents(articles) {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if(confirm('Na pewno usunąć ten artykuł?')) {
        const id = e.target.getAttribute('data-id');
        await supabase.from('article').delete().eq('id', id);
        fetchArticles(); 
      }
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      const article = articles.find(a => a.id == id);
      openModal(article); 
    });
  });
}

function openModal(article = null) {
  modal.classList.remove('hidden');
  
  if (article) {
    modalTitle.textContent = 'Edytuj artykuł';
    document.getElementById('article-id').value = article.id;
    document.getElementById('title').value = article.title;
    document.getElementById('subtitle').value = article.subtitle || '';
    document.getElementById('author').value = article.author;
    document.getElementById('content').value = article.content;
  } else {
    modalTitle.textContent = 'Dodaj nowy artykuł';
    form.reset();
    document.getElementById('article-id').value = '';
  }
}

function closeModal() {
  modal.classList.add('hidden');
  form.reset();
}

async function init() {
  await checkSession();
  await fetchArticles();
}

init();