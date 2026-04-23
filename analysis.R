###Chargement des données 

participants = read.csv("csv/participants.csv")
results = read.csv("csv/results.csv")

library(tidyverse)

# 1. Nettoyage et fusion
data_clean <- results %>%
  # On convertit les colonnes texte en vrais booléens (TRUE/FALSE)
  mutate(
    estCorrect = as.logical(estCorrect),
    illustration = as.logical(illustration)
  ) %>%
  left_join(participants, by = "id") %>%
  # On s'assure que 'etudiant' est bien traité comme un facteur
  mutate(etudiant = as.factor(etudiant))

# 2. Calcul du score par condition pour chaque participant
data_score <- data_clean %>%
  group_by(id, illustration, etudiant) %>%
  summarise(
    score = mean(estCorrect, na.rm = TRUE), 
    .groups = "drop"
  )

###Test hypothèse 1 : les performances d'apprentissage seront meilleures pour les parties avec des images 

anova_H1 = aov(data_score$score ~ data_score$illustration)
summary(anova_H1)

chisq.test(results$illustration, results$estCorrect)
chisq.test(results$illustration, results$tempsSecondes)
chisq.test(results$illustration, results$certitude)

###Test hypothèse 2 : les performances des étudiants seront meilleures que celles des non étudiants 

anova_H2 = aov(data_score$score ~ data_score$etudiant)
summary(anova_H2)

###Test hypothèse 3 : 

library(lmerTest)
modele_mixte <- lmer(score ~ illustration * etudiant + (1|id), data = data_score)
anova(modele_mixte)
