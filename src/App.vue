<template>
  <BContainer class="py-5">
    <BButton @click="openModal" variant="primary">Ajouter Facture</BButton>
    
    <BModal v-model="modal" title="Nouvelle Facture">
      <BForm @submit.prevent="saveFacture">
        <div class="mb-3">
          <BFormInput v-model="newFacture.nom" placeholder="Nom du client" required />
        </div>
        <div class="mb-3">
          <BFormInput v-model="newFacture.date" type="date" placeholder="Date" required />
        </div>
        <div v-for="(detail, index) in newFacture.details" :key="index" class="mb-3">
          <BFormInput v-model="detail.designation" placeholder="Désignation" required />
          <BFormInput v-model="detail.pu" type="number" placeholder="Prix Unitaire" required />
          <BFormInput v-model="detail.quantite" type="number" placeholder="Quantité" required />
        </div>
        <BButton @click="addDetail" variant="info">Ajouter Détail</BButton>
        <BButton type="submit" variant="primary" v-show="show">Enregistrer</BButton>
        <BButton variant="primary" v-show="!show" @click="factureEdit(newFacture.id)">Modifier</BButton>
      </BForm>
    </BModal>

    <!-- Modale de la facture -->
    <BModal v-model="visuel" title="Voir Facture">
      <BContainer id="facture">
        <h1>{{ newFacture.nom }}</h1>
        <p>Date : {{ newFacture.date }}</p>
        
        <BTableSimple responsive>
          <BThead>
            <BTr>
              <BTh sticky-column>Designation</BTh>
              <BTh>Qt</BTh>
              <BTh>PU</BTh>
              <BTh>Total</BTh>
            </BTr>
          </BThead>
          <BTbody>
            <BTr v-for="detail in newFacture.details" :key="detail.designation">
              <BTh sticky-column>{{ detail.designation }}</BTh>
              <BTd>{{ detail.quantite }}</BTd>
              <BTd>{{ detail.pu }}</BTd>
              <BTd>{{ detail.quantite * detail.pu }}</BTd>
            </BTr>
          </BTbody>
          <BTfoot>
            <BTr>
              <BTh>Total</BTh>
              <BTh>-</BTh>
              <BTh>-</BTh>
              <BTh>{{ somme }}</BTh>
            </BTr>
          </BTfoot>
        </BTableSimple>
      </BContainer>
      <BButton size="sm" @click="telecharger()">Generer l'image</BButton>
      <a href="" id="download">telecharger</a>
    </BModal>

    <!-- Tableau de factures -->
    <BTable :items="factures" :fields="fields">
      <template #cell(actions)="row">
        <BButton size="sm" @click="editFacture(row.item)">Modifier</BButton>
        <BButton size="sm" @click="deleteFacture(row.item.id)">Supprimer</BButton>
        <BButton size="sm" @click="visualiser(row.item)">Visualiser</BButton>
      </template>
    </BTable>
    
    <menu-icon />
    <android-icon fillColor="#FF0000" />
    <android-icon title="this is an icon!" />
    <android-icon :size="48" />
  </BContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BButton, BModal, BForm, BTable, BFormInput, BContainer, BTableSimple, BThead, BTr, BTh, BTbody, BTd, BTfoot } from 'bootstrap-vue-next';
import 'vue-material-design-icons/styles.css';
import MenuIcon from 'vue-material-design-icons/Menu.vue';
import AndroidIcon from 'vue-material-design-icons/Android.vue';
import html2canvas from 'html2canvas';

// Déclaration des composants
const components = {
  MenuIcon,
  AndroidIcon
};

const produit = ref(0);
const somme = ref(0);
const modal = ref(false);
const visuel = ref(false);
const factures = ref([]);
const show = ref(true);
const newFacture = ref({
  id: null,
  nom: '',
  date: '',
  details: [
    { designation: '', pu: 0, quantite: 0 }
  ]
});

const fields = ['nom', 'date', 'actions'];

// Ouvrir le modal pour ajouter une facture
function openModal() {
  show.value = true;
  modal.value = true;
  resetForm();
}

function visualiser(facture) {
  newFacture.value = { ...facture };
  somme.value = 0;
  facture.details.forEach((article) => {
    let produit = article.quantite * article.pu;
    somme.value += produit;
  });
  visuel.value = true;
}

// Ajouter un détail à la facture
function addDetail() {
  newFacture.value.details.push({ designation: '', pu: 0, quantite: 0 });
}

function telecharger() {
  const contentElement = document.getElementById("facture") as HTMLElement;
  const downloadButton = document.getElementById("download") as HTMLAnchorElement;
  html2canvas(contentElement).then((canvas) => {
    const imageData = canvas.toDataURL("image/jpg");
    const newData = imageData.replace(/^data:image\/jpg/, "data:application/octet-stream");

    downloadButton.download = "image.jpg";
    downloadButton.href = newData;
  });
}

// Réinitialiser le formulaire de la nouvelle facture
function resetForm() {
  newFacture.value = {
    id: null,
    nom: '',
    date: '',
    details: [{ designation: '', pu: 0, quantite: 0 }]
  };
}

// Charger les factures depuis localStorage
function loadFactures() {
  const storedFactures = localStorage.getItem('factures');
  if (storedFactures) {
    factures.value = JSON.parse(storedFactures);
  } else {
    factures.value = [];
  }
}

// Sauvegarder les factures dans localStorage
function saveFactures() {
  localStorage.setItem('factures', JSON.stringify(factures.value));
}

async function factureEdit(id) {
  const index = factures.value.findIndex(f => f.id === id);
  if (index !== -1) {
    factures.value[index] = { ...newFacture.value };
    saveFactures();
  }
  show.value = true;
  modal.value = false;
  loadFactures();
}

// Sauvegarder une nouvelle facture dans localStorage
async function saveFacture() {
  if (newFacture.value.nom && newFacture.value.date) {
    // Générer un ID unique
    const newId = Date.now().toString();
    const factureToSave = {
      ...newFacture.value,
      id: newId
    };
    
    factures.value.push(factureToSave);
    saveFactures();
    modal.value = false;
    loadFactures();
  }
}

// Supprimer une facture
async function deleteFacture(id) {
  factures.value = factures.value.filter(f => f.id !== id);
  saveFactures();
  loadFactures();
}

// Modifier une facture (Chargement des infos dans le modal)
function editFacture(facture) {
  newFacture.value = { ...facture };
  show.value = false;
  modal.value = true;
}

onMounted(() => {
  loadFactures();
});
</script>

<style>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.auth-input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.user-details {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>