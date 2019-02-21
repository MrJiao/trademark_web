package com.bjhy.trademark.core.dao;


import com.bjhy.trademark.core.domain.TrademarkBean;
import org.apel.gaia.persist.dao.CommonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface TrademarkBeanRepository extends CommonRepository<TrademarkBean, String>{

    List<TrademarkBean> findByAnNumAndNameIn(String annm,List<String> names);

    List<TrademarkBean> findByAnNum(String annm);

    @Query(value = "SELECT * FROM TRADEMARKBEAN t WHERE t.annum = :annum and t.name in (SELECT Name FROM TRADEMARKBEAN GROUP BY Name HAVING Count(*) > 1) ORDER BY ?#{#pageable}",
            countQuery = "SELECT SUM(COUNT(NAME)) as \"count(*)\" FROM TRADEMARKBEAN WHERE ANNUM = :annum GROUP BY Name  HAVING count(*)>1",
            nativeQuery = true)
    Page<TrademarkBean> findBySameNameByAnnum(@Param("annum") String annum, Pageable pageable);

    @Query(value = "SELECT * FROM TRADEMARKBEAN t WHERE t.name in (SELECT Name FROM TRADEMARKBEAN GROUP BY Name HAVING Count(*) > 1) ORDER BY ?#{#pageable}",
            countQuery = "SELECT SUM(COUNT(NAME)) as \"count(*)\" FROM TRADEMARKBEAN GROUP BY Name  HAVING count(*)>1",
            nativeQuery = true)
    Page<TrademarkBean> findBySameName(Pageable pageable);

    void deleteByAnNum(String annum);

    TrademarkBean findTopByAnNum(String annum);


    List<TrademarkBean> findByPicEncode(String picEncode);

    @Query(value = "select t.id from TRADEMARKBEAN t where t.id=:id",nativeQuery = true)
    List<String> findIds(@Param("id") String id);
}
