package fr.openent.diary.model.general;

public enum HomeworkType {

    //Objets directement construits
    DevoirMaison ("Devoir Maison", "DM"),
    Exercice ("Exercice(s)", "EX"),
    Autre ("Autre", "A");

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
