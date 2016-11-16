package fr.openent.diary.utils;

public enum HomeworkType {

    //Objets directement construits
    DevoirMaison ("Devoir Maison test", "DM"),
    Exercice ("Exercice(s) test", "EX"),
    Autre ("Autre test", "A");

    private String label = "";
    private String category = "";

    //Constructeur
    HomeworkType(String label, String category){
        this.label = label;
        this.category = category;
    }

    public String getLabel(){
        return this.label;
    }

    public String getCategory(){
        return this.category;
    }

    //HomeworkType[] homeworkTypes = HomeworkType.values();


}
