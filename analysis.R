###Chargement des données 

participants = read.csv("csv/participants.csv")
results = read.csv("csv/results.csv")

library(tidyverse)

#Nettoyage des données
data_clean = results %>%
  #convertir "estCorrect" et "illustration" en vrais booléens 
  mutate(
    estCorrect = as.logical(estCorrect),
    illustration = as.logical(illustration)
  ) %>%
  left_join(participants, by = "id") %>%
  mutate(etudiant = as.factor(etudiant))

#Calcul du score par condition pour chaque participant (score entre 0 et 1, avec 1 si tout est juste et 0 si tout est faux)
data_score = data_clean %>%
  group_by(id, illustration, etudiant) %>%
  summarise(
    score = mean(estCorrect, na.rm = TRUE), 
    .groups = "drop"
  )

data_certitude = results |>
  mutate(certitude = certitude) |> 
  left_join(participants, by = "id") |>
  group_by(id, illustration, etudiant) |>
  summarise(moy_certitude = mean(certitude, na.rm = TRUE), .groups = "drop")

data_temps <- results |>
  mutate(tempsSecondes = tempsSecondes) |>
  left_join(participants, by = "id") |>
  group_by(id, illustration, etudiant) |>
  summarise(moy_temps = mean(tempsSecondes, na.rm = TRUE), .groups = "drop")

###Test hypothèse 1 : les performances d'apprentissage seront meilleures pour les parties avec des images 

anova_H1 = aov(data_score$score ~ data_score$illustration)
summary(anova_H1)

modele_certitude = lmer(moy_certitude ~ illustration * etudiant + (1|id), data = data_certitude)
anova(modele_certitude)

modele_temps = lmer(moy_temps ~ illustration * etudiant + (1|id), data = data_temps)
anova(modele_temps)

chisq.test(data_score$score, data_score$illustration)
chisq.test(data_clean$illustration, data_clean$tempsSecondes)
chisq.test(data_clean$illustration, data_clean$certitude)

boxplot(data_score$score~data_score$illustration, main = "Scores obtenus selon qu'il y ait 
  des illustrations ou non", xlab = "Niveau d'illustration", ylab="Scores obtenus")

boxplot(data_certitude$moy_certitude~data_certitude$illustration, main = "Niveau de certitude selon qu'il y ait 
  des illustrations ou non", xlab = "Niveau d'illustration", ylab="Niveau de certitude")

boxplot(data_temps$moy_temps~data_temps$illustration)

###Test hypothèse 2 : les performances des étudiants seront meilleures que celles des non étudiants 

anova_H2 = aov(data_score$score ~ data_score$etudiant)
summary(anova_H2)

chisq.test(data_score$score, data_score$etudiant)


###Test hypothèse 1, 2 et 3 : 

library(lmerTest)

modele_mixte = lmer(score ~ illustration * etudiant + (1|id), data = data_score)
anova(modele_mixte)

modele_certitude = lmer(moy_certitude ~ illustration * etudiant + (1|id), data = data_certitude)
anova(modele_certitude)

modele_temps = lmer(moy_temps ~ illustration * etudiant + (1|id), data = data_temps)
anova(modele_temps)


