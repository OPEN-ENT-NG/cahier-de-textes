import {INotebook, INotebookResponse, Notebook} from "../Notebook";

const notebookResponse: INotebookResponse = {
    page: 0,
    page_count: 0,
    all: [{
       notebook_id: "test_notebook"
    } as INotebook]
};

describe('NotebookModel', () => {
    const notebook: Notebook = new Notebook("test_structure");

    test('It should init Notebook instance correctly', () => {
        expect(notebook.structure_id).toBeTruthy();
        expect(notebook.notebookResponse).toBeTruthy();
    });

    test('Calling build from Notebook instance should be successful', () => {
        notebook.build(notebookResponse);
        expect(notebook.notebookResponse).toBeDefined();
    });
});