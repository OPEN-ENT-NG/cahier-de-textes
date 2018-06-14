package fr.openent.diary.controllers;

import fr.openent.diary.model.GenericHandlerResponse;
import fr.openent.diary.model.HandlerResponse;
import fr.openent.diary.model.lessonview.LessonModel;
import fr.openent.diary.model.util.KeyValueModel;
import fr.openent.diary.model.visa.*;
import fr.openent.diary.services.PdfServiceImpl;
import fr.openent.diary.services.VisaServiceImpl;
import fr.openent.diary.utils.DiaryLambda;
import fr.openent.diary.utils.SqlMapper;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.Renders;
import org.entcore.common.controller.ControllerHelper;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;


public class VisaController extends ControllerHelper {

    @Override
    protected void setLambdaTemplateRequest(final HttpServerRequest request, final Map<String, Object> ctx) {
        super.setLambdaTemplateRequest(request, ctx);
        DiaryLambda.setLambdaTemplateRequest(request, ctx);
    }

    private final static Logger log = LoggerFactory.getLogger(VisaController.class);
    private VisaServiceImpl visaService;
    private PdfServiceImpl pdfService;

    public VisaController(VisaServiceImpl visaService, PdfServiceImpl pdfService) {
        this.visaService = visaService;
        this.pdfService = pdfService;
    }


    @Post("/inspect/right/:structureId/:inspectorId")
    @SecuredAction("diary.manageInspect.apply")
    public void apllyInspectorRight(final HttpServerRequest request) {
        final String inspectorId = request.params().get("inspectorId");
        final String structureId = request.params().get("structureId");

        SqlMapper.mappListRequest(request, KeyValueModel.class, new Handler<HandlerResponse<List<KeyValueModel>>>() {

            public void handle(HandlerResponse<List<KeyValueModel>> event) {
                if (event.hasError()){
                    badRequest(request,event.getMessage());
                }else{
                    visaService.updateInspector(structureId,inspectorId,event.getResult(),GenericHandlerResponse.genericHandle(request));
                }
            }
        });

    }


    @Get("/inspect/getTeacher/:structureId/:inspectorId")
    @SecuredAction("diary.manageInspect.list.teacher")
    public void getTeacher(final HttpServerRequest request) {
        String inspectorId = request.params().get("inspectorId");
        String structureId = request.params().get("structureId");
        this.visaService.getTeacherForManageInspectors(inspectorId,structureId,GenericHandlerResponse.<TeacherToInspectorManagement>handler(request));
    }

    @Get("/inspect/getInspectors")
    @SecuredAction("diary.manageInspect.list.inspector")
    public void getInspectors(final HttpServerRequest request) {
        this.visaService.getAllInspector(GenericHandlerResponse.<List<KeyValueModel>>handler(request));
    }


    @Get("/visa/filtersinspector/:structureId/:inspectorId")
    @SecuredAction("diary.visa.inspect.filters")
    public void getInspectorFilters(final HttpServerRequest request) {
        String structureId = request.params().get("structureId");
        String inspectorId = request.params().get("inspectorId");
        this.visaService.getFilters(structureId,inspectorId, GenericHandlerResponse.<VisaFilters>handler(request));
    }

    @Get("/visa/filters/:structureId")
    @SecuredAction("diary.visa.admin.filters")
    public void getFilters(final HttpServerRequest request) {
        String structureId = request.params().get("structureId");
        this.visaService.getFilters(structureId,null, GenericHandlerResponse.<VisaFilters>handler(request));
    }

    @Get("/visa/agregs")
    @SecuredAction(value = "diary.visa.agregs")
    public void getAgregs(final HttpServerRequest request) {

        String structureId = request.params().get("structureId");
        String teacherId = request.params().get("teacherId");
        String audienceId = request.params().get("audienceId");
        String subjectId = request.params().get("subjectId");
        String todoOnly = request.params().get("statut");

        this.visaService.getAllAgregatedVisas(structureId,teacherId,audienceId,subjectId,todoOnly,GenericHandlerResponse.<List<ResultVisaList>>handler(request));

    }


    @Post("/visa/apply/:lock")
    @SecuredAction(value = "diary.visa.applyvisa")
    public void applyVisa(final HttpServerRequest request) {
        final Boolean lock = request.params().get("lock").equals("true");
        SqlMapper.mappRequest(request, ApplyVisaModel.class, new Handler<HandlerResponse<ApplyVisaModel>>() {
            @Override
            public void handle(HandlerResponse<ApplyVisaModel> event) {
                if (event.hasError()){
                    badRequest(request,event.getMessage());
                }else{
                    visaService.applyVisas(event.getResult(),lock,GenericHandlerResponse.genericHandle(request));
                }
            }


        });

    }

    @Post("/visa/lessons")
    @SecuredAction(value = "diary.visa.list.lessons")
    public void lessons(final HttpServerRequest request) {

        SqlMapper.mappListRequest(request, VisaModel.class, new Handler<HandlerResponse<List<VisaModel>>>() {
            @Override
            public void handle(HandlerResponse<List<VisaModel>> event) {
                if (event.hasError()){
                    badRequest(request,event.getMessage());
                }else{
                    visaService.getLessons(event.getResult(),GenericHandlerResponse.<List<LessonModel>>handler(request));
                }
            }


        });

    }


    @Post("/visa/pdf")
    @SecuredAction(value = "diary.visa.list.lessons.pdf")
    public void pdf(final HttpServerRequest request) throws URISyntaxException {
        final Renders render = this;
        SqlMapper.mappListRequest(request, VisaModel.class, new Handler<HandlerResponse<List<VisaModel>>>() {
            @Override
            public void handle(HandlerResponse<List<VisaModel>> event) {
                final List<VisaModel> visaModels = event.getResult();

                if (event.hasError()){
                    badRequest(request,event.getMessage());
                }else{
                    visaService.getLessons(visaModels, pdfService.lessonPdfGenerator(render,null,request,vertx,eb));
                }
            }
        });
    }


    @Get("/otherteacher/filters")
    @SecuredAction(value="diary.view.otherteacher")
    public void getOtherTeacherFilter(final HttpServerRequest request){

        /*UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if(user != null){
                    if (SecureUtils.hasRight(user,"diary.visa.inspect.filters")){

                    }else if if (SecureUtils.hasRight(user,"diary.visa.admin.filters")){{

                    }

                } else {
                    unauthorized(request, "No user found in session.");
                }
            }
        });
        String structureId = request.params().get("structureId");
        this.visaService.getFilters(structureId,null, GenericHandlerResponse.<VisaFilters>handler(request));
        */
    }
}
