###Chargement des données 

participants = read.csv("csv/participants.csv")
results = read.csv("csv/results.csv")

library(tidyverse)
library(tidyselect)
library(lmerTest)

###Formation des données pour l'analyse 
#Nettoyage et rassemblement des données
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

#Calcul de la certitude moyenne par participant pour chaque condition 
data_certitude = results |>
  mutate(certitude = certitude) |> 
  left_join(participants, by = "id") |>
  group_by(id, illustration, etudiant) |>
  summarise(moy_certitude = mean(certitude, na.rm = TRUE), .groups = "drop")

#Calcul du temps moyen mis par question par participant pour chaque condition 
data_temps <- results |>
  mutate(tempsSecondes = tempsSecondes) |>
  left_join(participants, by = "id") |>
  group_by(id, illustration, etudiant) |>
  summarise(moy_temps = mean(tempsSecondes, na.rm = TRUE), .groups = "drop")


###Données sur les participants 
#Age
age_moy = mean(participants$age)

age_moy_etu = mean(as.numeric(participants$age[participants$etudiant == "true"]))
et_etu = sd(as.numeric(participants$age[participants$etudiant == "true"]))

age_moy_nnetu = mean(as.numeric(participants$age[participants$etudiant == "false"]))
et_nnetu = sd(as.numeric(participants$age[participants$etudiant == "false"]))


boxplot(participants$age ~participants$etudiant, main="Répartition de l'âge selon le statut étudiant", xlab="Statut étudiant", ylab="Age")

#Genre 
table(participants$genre) #5 femmes et 11 hommes 



###Test hypothèse 1 : les performances d'apprentissage seront meilleures pour les parties avec des images 

anova_H1 = aov(data_score$score ~ data_score$illustration)
summary(anova_H1)

modele_mixte = lmer(score ~ illustration * etudiant + (1|id), data = data_score)
anova(modele_mixte)

modele_certitude = lmer(moy_certitude ~ illustration * etudiant + (1|id), data = data_certitude)
anova(modele_certitude)

modele_temps = lmer(moy_temps ~ illustration * etudiant + (1|id), data = data_temps)
anova(modele_temps)

#Tests de corrélation 
chisq.test(data_score$score, data_score$illustration)
chisq.test(data_clean$illustration, data_clean$tempsSecondes)
chisq.test(data_clean$illustration, data_clean$certitude)

#Représentations graphiques 
boxplot(data_score$score~data_score$illustration, main = "Scores obtenus selon qu'il y ait 
  des illustrations ou non", xlab = "Niveau d'illustration", ylab="Scores obtenus")

boxplot(data_certitude$moy_certitude~data_certitude$illustration, main = "Niveau de certitude selon qu'il y ait 
  des illustrations ou non", xlab = "Niveau d'illustration", ylab="Niveau de certitude")

boxplot(data_temps$moy_temps~data_temps$illustration)

###Test hypothèse 2 : les performances des étudiants seront meilleures que celles des non étudiants 

anova_H2 = aov(data_score$score ~ data_score$etudiant)
summary(anova_H2)

chisq.test(data_score$score, data_score$etudiant)

modele_mixte = lmer(score ~ illustration * etudiant + (1|id), data = data_score)
anova(modele_mixte)

modele_certitude = lmer(moy_certitude ~ illustration * etudiant + (1|id), data = data_certitude)
anova(modele_certitude)

modele_temps = lmer(moy_temps ~ illustration * etudiant + (1|id), data = data_temps)
anova(modele_temps)

###Test hypothèse 1, 2 et 3 : 

modele_mixte = lmer(score ~ illustration * etudiant + (1|id), data = data_score)
anova(modele_mixte)

modele_certitude = lmer(moy_certitude ~ illustration * etudiant + (1|id), data = data_certitude)
anova(modele_certitude)

modele_temps = lmer(moy_temps ~ illustration * etudiant + (1|id), data = data_temps)
anova(modele_temps)

#Pour le groupe étudiant
data_etudiants <- data_score %>%
  filter(etudiant == "true") %>%
  group_by(illustration) %>%
  summarise(moyenne_score = mean(score),se = sd(score) / sqrt(n()), .groups = "drop")

data_certitude_etud <- data_certitude %>%
  filter(etudiant == "true") %>%
  group_by(illustration) %>%
  summarise(
    moyenne = mean(moy_certitude, na.rm = TRUE),
    se = sd(moy_certitude, na.rm = TRUE) / sqrt(n()),
    .groups = "drop"
  )

data_temps_etud <- data_temps %>%
  filter(etudiant == "true") %>% 
  group_by(illustration) %>%
  summarise(
    temps_moyen = mean(moy_temps, na.rm = TRUE),
    se = sd(moy_temps, na.rm = TRUE) / sqrt(n()),
    .groups = "drop"
  )

ggplot(data_etudiants, aes(x = illustration, y = moyenne_score, fill = illustration)) +
  geom_bar(stat = "identity", width = 0.5, color = "black") +
  scale_fill_manual(values = c("grey", "skyblue"), labels = c("Texte seul", "Avec illustrations")) +
  labs(
    title = "Performance des étudiants selon le support",
    x = "Type de support",
    y = "Score moyen",
    fill = "Condition") + ylim(0,1)

ggplot(data_certitude_etud, aes(x = illustration, y = moyenne, fill = illustration)) +
  geom_bar(stat = "identity", width = 0.5, color = "black") +
  scale_fill_manual(values = c("grey", "skyblue"), labels = c("Texte seul", "Avec illustrations")) +
  labs(
    title = "Certitude des étudiants selon le support",
    x = "Type de support",
    y = "Certitude moyenne", 
    fill = "Condition"
  )+ ylim(0,7)

ggplot(data_temps_etud, aes(x = illustration, y = temps_moyen, fill = illustration)) +
  geom_bar(stat = "identity", width = 0.5, color = "black") +
  scale_fill_manual(values = c("grey", "skyblue"), 
                    labels = c("Texte seul", "Avec illustrations")) +
  labs(
    title = "Temps de réponse moyen des étudiants",
    x = "Type de support",
    y = "Temps moyen par question",
    fill ="Condition"
  ) + ylim(0,30)

#Pour le groupe non-étudiant
data_nnetudiants <- data_score %>%
  filter(etudiant == "false") %>%
  group_by(illustration) %>%
  summarise(moyenne_score = mean(score),se = sd(score) / sqrt(n()), .groups = "drop")

data_certitude_nnetud <- data_certitude %>%
  filter(etudiant == "false") %>%
  group_by(illustration) %>%
  summarise(
    moyenne = mean(moy_certitude, na.rm = TRUE),
    se = sd(moy_certitude, na.rm = TRUE) / sqrt(n()),
    .groups = "drop"
  )

data_temps_nnetud <- data_temps %>%
  filter(etudiant == "false") %>% 
  group_by(illustration) %>%
  summarise(
    temps_moyen = mean(moy_temps, na.rm = TRUE),
    se = sd(moy_temps, na.rm = TRUE) / sqrt(n()),
    .groups = "drop"
  )

ggplot(data_nnetudiants, aes(x = illustration, y = moyenne_score, fill = illustration)) +
  geom_bar(stat = "identity", width = 0.5, color = "black") +
  scale_fill_manual(values = c("gray70", "skyblue"), labels = c("Texte seul", "Avec illustrations")) +
  labs(
    title = "Performance des non étudiants selon le support",
    x = "Type de support",
    y = "Score moyen",
    fill = "Condition")  + ylim(0,1)

ggplot(data_certitude_nnetud, aes(x = illustration, y = moyenne, fill = illustration)) +
  geom_bar(stat = "identity", width = 0.5, color = "black") +
  scale_fill_manual(values = c("grey", "skyblue"), labels = c("Texte seul", "Avec illustrations")) +
  labs(
    title = "Certitude des non-étudiants selon le support",
    x = "Type de support",
    y = "Certitude moyenne", 
    fill = "Condition"
  ) + ylim(0,7)

ggplot(data_temps_nnetud, aes(x = illustration, y = temps_moyen, fill = illustration)) +
  geom_bar(stat = "identity", width = 0.5, color = "black") +
  scale_fill_manual(values = c("grey", "skyblue"), 
                    labels = c("Texte seul", "Avec illustrations")) +
  labs(
    title = "Temps de réponse moyen des non-étudiants",
    x = "Type de support",
    y = "Temps moyen par question", 
    fill = "Condition"
  ) + ylim(0,30)


