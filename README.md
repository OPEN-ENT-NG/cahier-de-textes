# Cahier de textes

* Licence : [AGPL v3](http://www.gnu.org/licenses/agpl.txt) Copyright Région Hauts-de-France (ex Picardie), Département Essonne, Région Nouvelle Aquitaine (ex Poitou-Charente)
* Développeur : Atos, CGI
* Financeur : Région Hauts-de-France (ex Picardie), Département Essonne, Région Nouvelle Aquitaine (ex Poitou-Charente)
* Description : Cahier de textes 


[Documentation technique](./docs/README.md)

## Configuration

<pre>
{
"config": {
  ...
  "pdf-generator" : {
       "url" : "$pdfGeneratorUrl",
       "auth" : "$pdfGeneratorAuth"
  },
  "node-pdf-generator" : {
      "pdf-connector-id": "exportpdf",
      "auth": "${nodePdfToken}",
      "url" : "${nodePdfUri}"
  }
}

</pre>
Dans votre springboard, vous devez inclure des variables d'environnement :
<pre>
nodePdfToken=${String}
nodePdfUri=${String}

pdfGeneratorUrl=${String}
pdfGeneratorAuth=${String}
</pre>

Il est nécessaire de mettre ***diary:true*** dans services du module vie scolaire afin de paramétrer les données de configuration de cahier de texte.
<pre>
"services": {
     ...
     "diary": true,
     ...
 }
</pre>

Se connecter à l'ENT en tant que Personnel, aller sur Vie Scolaire, choisir une grille horaire d'un établissement,
aller sur l'onglet Cahier de texte dans Vie Scolaire, activer le module et initialiser les paramètres.


### Archivage

~~L'événement `transition` est positionné pour archiver les cahier de textes~~ Il faudra lancer l'endpoint avant la transition comme la génération se base sur les informations des groupes/matières
####
l'API `POST` `diary/structures/:structureId/notebooks/archives` ([Payload](./src/main/resources/jsonschema/archiveProcess.json) valeur étant l'année de la période - e.g `2022` l'année où cela se termine) peut être également utilisé pour lancer la transition manuellement

Pour voir si tout s'est bien passé lors de l'archivage, `diary.notebook_archive` doit être remplis pour chaque `structure_id`
```postgresql
WITH structures AS (
    SELECT structure_id FROM diary.settings
)
SELECT structure_id, count(id) FROM diary.notebook_archive
WHERE structure_id IN (SELECT structure_id FROM structures)
  AND archive_school_year = '2020-2021' -- un exemple, period en question
GROUP BY structure_id
```

Les cahiers de textes devraient normalement être vide pour chaque établissement 
```postgresql
WITH structures AS (
    SELECT structure_id FROM diary.settings
)
SELECT structure_id, count(id) FROM diary.notebook
WHERE structure_id IN (SELECT structure_id FROM structures)
  AND notebook.date <= '2021-07-31' -- un exemple, period en question (la limite)
GROUP BY structure_id
ORDER BY structure_id ASC
```